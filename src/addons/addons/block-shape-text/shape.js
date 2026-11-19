export default async function ({ addon, console }) {
  var BlocklyInstance = await addon.tab.traps.getBlockly();

  (function (Blockly) {
    const BlockSvg = BlocklyInstance.BlockSvg;
    var vm = addon.tab.traps.vm;

    const ogFieldImageInit = BlocklyInstance.FieldImage.prototype.init;

    const { GRID_UNIT } = BlockSvg;

    function path2SegmentList(path) {
      const cmds = structuredClone(BlockSvg.CUSTOM_NOTCH_UTIL.supportedCommands);
      cmds.z = 0;
      const segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig;
    	const data = [];
    	path.replace(segment, (_, command, args) => {
    		let type = command.toLowerCase();
    		const numbers = args.match(/-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig);
    		args = numbers ? numbers.map(Number) : [];
		    if (type == "m" && args.length > 2) {
		    	data.push([command].concat(args.splice(0, 2)));
		    	type = "l";
		    	command = command == "m" ? "l" : "L";
		    }

        while (true) {
          if (args.length == cmds[type]) {
            args.unshift(command);
            return data.push(args);
          }
          if (args.length < cmds[type]) throw new Error("malformed path data");
          data.push([command].concat(args.splice(0, cmds[type])));
        }
      });
      return data;
    }

    function scalePathXY (path, scaleX, scaleY) {
      const segments = path2SegmentList(path);
      return segments.map((segment) => {
        const name = segment[0].toLowerCase();
        if (name === "v") {
          segment[1] *= scaleY;
          return segment;
        }
        if (name === "a") {
          segment[1] *= scaleX;
          segment[2] *= scaleY;
          segment[6] *= scaleX;
          segment[7] *= scaleY;
          return segment;
        }

        return segment.map((val, i) => {
          if (!i) return val;
          return val *= i % 2 ? scaleX : scaleY;
        });
      }).flat().join(" ");
    }

    function updateAllBlocks() {
      const workspace = Blockly.getMainWorkspace();
      if (workspace) {
        if (vm.editingTarget) {
          vm.emitWorkspaceUpdate();
        }
        const flyout = workspace.getFlyout();
        if (flyout) {
          const flyoutWorkspace = flyout.getWorkspace();
          Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.workspaceToDom(flyoutWorkspace), flyoutWorkspace);
          workspace.getToolbox().refreshSelection();
          workspace.toolboxRefreshEnabled_ = true;
        }
      }
    }

    function applyChanges(
      paddingSize = addon.settings.get("paddingSize"),
      cornerSize = addon.settings.get("cornerSize"),
      notchSize = addon.settings.get("notchSize"),
      iconSize = addon.settings.get("iconSize")
    ) {
      let multiplier = paddingSize / 100;
      cornerSize = cornerSize / 100;
      notchSize = notchSize / 100;
      iconSize = iconSize / 100;

      BlockSvg.SEP_SPACE_Y = 2 * GRID_UNIT * multiplier;
      BlockSvg.MIN_BLOCK_X = 16 * GRID_UNIT * multiplier;
      BlockSvg.MIN_BLOCK_X_OUTPUT = 12 * GRID_UNIT * multiplier;
      BlockSvg.MIN_BLOCK_X_SHADOW_OUTPUT = 10 * GRID_UNIT * multiplier;
      BlockSvg.MIN_BLOCK_Y = 12 * GRID_UNIT * multiplier;
      BlockSvg.EXTRA_STATEMENT_ROW_Y = 8 * GRID_UNIT * multiplier;
      BlockSvg.MIN_BLOCK_X_WITH_STATEMENT = 40 * GRID_UNIT * multiplier;
      BlockSvg.MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT = 8 * GRID_UNIT * multiplier;
      BlockSvg.MIN_BLOCK_Y_REPORTER = 10 * GRID_UNIT * multiplier;
      BlockSvg.MIN_STATEMENT_INPUT_HEIGHT = 6 * GRID_UNIT * multiplier;
      BlockSvg.NOTCH_WIDTH = 8 * GRID_UNIT * multiplier;
      BlockSvg.NOTCH_HEIGHT = 2 * GRID_UNIT * multiplier * notchSize;
      BlockSvg.NOTCH_START_PADDING = 3 * GRID_UNIT; //* multiplier
      BlockSvg.ICON_SEPARATOR_HEIGHT = 10 * GRID_UNIT * multiplier * iconSize;

      // Triangle notches, as wide and deep as the curved ones they replaced
      const notchHalf = (16 + 8 * multiplier * notchSize + 24 * (multiplier - 0.5)) / 2;
      const notchDepth = 4 * notchSize + 4 * multiplier * notchSize;
      BlockSvg.NOTCH_PATH_LEFT = `l ${notchHalf} ${notchDepth} l ${notchHalf} ${-notchDepth} `;
      BlockSvg.NOTCH_PATH_RIGHT =
        `h ${(-4 * (cornerSize - 1) - 5 * (1 - notchSize))} ` +
        `l ${-notchHalf} ${notchDepth} l ${-notchHalf} ${-notchDepth} `;

      /* Custom Notch API Support */
      const adjustedNotchSize = (multiplier > 1 ? multiplier - 0.05 :
          multiplier < 1 ? multiplier + 0.05 : multiplier) + ((cornerSize - 1) / 10);
      BlockSvg.CUSTOM_NOTCHES.forEach((notch) => {
        if (!notch.ogLeft) {
          notch.ogLeft = notch.left;
          notch.ogRight = notch.right;
        }
        notch.left = scalePathXY(notch.ogLeft, adjustedNotchSize, notchSize);
        notch.right = scalePathXY(notch.ogRight, adjustedNotchSize, notchSize);
      });

      BlockSvg.INPUT_SHAPE_HEXAGONAL_WIDTH = 12 * GRID_UNIT * multiplier;
      BlockSvg.INPUT_SHAPE_HEXAGONAL =
        "M " +
        4 * GRID_UNIT * multiplier +
        ",0 " +
        " h " +
        4 * GRID_UNIT +
        " l " +
        4 * GRID_UNIT * multiplier +
        "," +
        4 * GRID_UNIT * multiplier +
        " l " +
        -4 * GRID_UNIT * multiplier +
        "," +
        4 * GRID_UNIT * multiplier +
        " h " +
        -4 * GRID_UNIT +
        " l " +
        -4 * GRID_UNIT * multiplier +
        "," +
        -4 * GRID_UNIT * multiplier +
        " l " +
        4 * GRID_UNIT * multiplier +
        "," +
        -4 * GRID_UNIT * multiplier +
        " z";
      BlockSvg.INPUT_SHAPE_ROUND_WIDTH = 12 * GRID_UNIT * multiplier;
      BlockSvg.INPUT_SHAPE_ROUND =
        "M " +
        4 * GRID_UNIT * multiplier +
        ",0" +
        " h " +
        4 * GRID_UNIT * multiplier +
        " a " +
        4 * GRID_UNIT * multiplier +
        " " +
        4 * GRID_UNIT * multiplier +
        " 0 0 1 0 " +
        8 * GRID_UNIT * multiplier +
        " h " +
        -4 * GRID_UNIT * multiplier +
        " a " +
        4 * GRID_UNIT * multiplier +
        " " +
        4 * GRID_UNIT * multiplier +
        " 0 0 1 0 -" +
        8 * GRID_UNIT * multiplier +
        " z";

      BlockSvg.INPUT_SHAPE_SQUARE_WIDTH = 12 * GRID_UNIT * multiplier;

      BlockSvg.INPUT_SHAPE_HEIGHT = 8 * GRID_UNIT * multiplier;
      BlockSvg.FIELD_HEIGHT = 8 * GRID_UNIT * multiplier; // NOTE: Determines string input heights
      BlockSvg.FIELD_WIDTH = 6 * GRID_UNIT * Math.min(multiplier, 1) + 10 * GRID_UNIT * Math.max(multiplier - 1, 0);
      BlockSvg.FIELD_DEFAULT_CORNER_RADIUS = 4 * GRID_UNIT * multiplier;
      BlockSvg.EDITABLE_FIELD_PADDING = 1.5 * GRID_UNIT * multiplier;
      BlockSvg.BOX_FIELD_PADDING = 2 * GRID_UNIT * multiplier;
      BlockSvg.DROPDOWN_ARROW_PADDING = 2 * GRID_UNIT * multiplier;
      BlockSvg.FIELD_WIDTH_MIN_EDIT = 8 * GRID_UNIT * multiplier;
      BlockSvg.INPUT_AND_FIELD_MIN_X = 12 * GRID_UNIT * multiplier;
      BlockSvg.INLINE_PADDING_Y = 1 * GRID_UNIT * multiplier; // For when reporters are inside reporters
      BlockSvg.SHAPE_IN_SHAPE_PADDING[1][0] = 5 * GRID_UNIT * multiplier;
      BlockSvg.SHAPE_IN_SHAPE_PADDING[1][2] = 5 * GRID_UNIT * multiplier;
      BlockSvg.SHAPE_IN_SHAPE_PADDING[1][3] = 5 * GRID_UNIT * multiplier;

      var originalDropdownObject = BlocklyInstance.FieldDropdown.prototype.positionArrow;
      BlocklyInstance.FieldDropdown.prototype.positionArrow = function (x) {
        this.arrowY_ = 11 * multiplier;
        return originalDropdownObject.call(this, x);
      };

      // Corner setting: 0 draws square corners (no arcs), anything else rounds them
      const r = (BlockSvg.CORNER_RADIUS = (1 * GRID_UNIT * cornerSize * 100) / 100);
      const d = BlockSvg.DEFINE_HAT_CORNER_RADIUS;
      const arc = (sweep, dx, dy, rad = r) => `a ${rad},${rad} 0 0,${sweep} ${dx},${dy}`;
      BlockSvg.TOP_LEFT_CORNER_START = "m 0," + r;
      BlockSvg.TOP_LEFT_CORNER = r ? `A ${r},${r} 0 0,1 ${r},0` : "";
      BlockSvg.TOP_RIGHT_CORNER = r ? arc(1, r, r) : "";
      BlockSvg.BOTTOM_RIGHT_CORNER = r ? " " + arc(1, -r, r) : "";
      BlockSvg.BOTTOM_LEFT_CORNER = r ? arc(1, -r, -r) : "";
      BlockSvg.INNER_TOP_LEFT_CORNER = r ? " " + arc(0, -r, r) : "";
      BlockSvg.INNER_BOTTOM_LEFT_CORNER = r ? arc(0, r, r) : "";
      BlockSvg.TOP_RIGHT_CORNER_DEFINE_HAT =
        (r ? arc(1, d, d, d) : `h ${d} v ${d}`) + " v " + (1 * GRID_UNIT - r);

      // Empty text/mixed slot: same corners as the blocks (sharp at 0)
      BlockSvg.INPUT_SHAPE_SQUARE = squareSlotPath(r);

      BlockSvg.STATEMENT_INPUT_INNER_SPACE = 2.8 * GRID_UNIT - 0.9 * GRID_UNIT * cornerSize;

      BlocklyInstance.FieldImage.prototype.init = function (...args) {
        this.width_ *= iconSize;
        this.height_ *= iconSize;
        this.size_.width *= iconSize;
        this.size_.height *= iconSize;
        ogFieldImageInit.call(this, ...args);
      }
    }

    function squareSlotPath(radius) {
      const w = BlockSvg.INPUT_SHAPE_SQUARE_WIDTH, h = BlockSvg.INPUT_SHAPE_HEIGHT;
      const c = Math.min(radius, w / 2, h / 2);
      if (!c) return `m 0,0 h ${w} v ${h} h ${-w} z`;
      const a = (dx, dy) => `a ${c},${c} 0 0,1 ${dx},${dy}`;
      return `m 0,${c} ${a(c, -c)} h ${w - 2 * c} ${a(c, c)} v ${h - 2 * c} ${a(-c, c)} h ${-w + 2 * c} ${a(-c, -c)} z`;
    }

    function applyAndUpdate(...args) {
      applyChanges(...args);
      updateAllBlocks();
    }

    addon.settings.addEventListener("change", () => applyAndUpdate());

    addon.self.addEventListener("disabled", () => {
      // The editor's own look: Scratch 3.0 sizes with square corners
      applyChanges(100, 100, 100, 100);
      const r = BlockSvg.CORNER_RADIUS, d = BlockSvg.DEFINE_HAT_CORNER_RADIUS;
      BlockSvg.TOP_LEFT_CORNER = "V 0 H " + r;
      BlockSvg.TOP_RIGHT_CORNER = `h ${r} v ${r}`;
      BlockSvg.BOTTOM_RIGHT_CORNER = ` v ${r} h -${r}`;
      BlockSvg.BOTTOM_LEFT_CORNER = `h -${r} v -${r}`;
      BlockSvg.INNER_TOP_LEFT_CORNER = ` h -${r} v ${r}`;
      BlockSvg.INNER_BOTTOM_LEFT_CORNER = `v ${r} h ${r}`;
      BlockSvg.TOP_RIGHT_CORNER_DEFINE_HAT = `h ${d} v ${d}`;
      BlockSvg.INPUT_SHAPE_SQUARE = squareSlotPath(0);
      updateAllBlocks();
    });

    addon.self.addEventListener("reenabled", () => applyAndUpdate());

    applyAndUpdate();
  })(window.Blockly);
}
