import ScratchStorage from "scratch-storage";

import defaultProject from "./default-project";
import missingProject from "./tw-missing-project";

/**
 * Wrapper for ScratchStorage which adds default web sources.
 * @todo make this more configurable
 */
class Storage extends ScratchStorage {
    constructor() {
        super();
        this.cacheDefaultProject();
    }
    addOfficialScratchWebStores() {
        // PMDESKTOP section 23: no web stores. Projects and their files are never loaded from
        // projects.penguinmod.com, asset-cdn.penguinmod.com or assets.scratch.mit.edu; only the
        // built-in default / missing projects and the files inside opened projects are used.
    }
    setProjectHost(projectHost) {
        this.projectHost = projectHost;
    }
    setProjectToken(projectToken) {
        this.projectToken = projectToken;
    }
    setProjectID(projectId) {
        this.projectId = projectId;
    }
    getProjectGetConfig(projectAsset) {
        // projectHost ends in "projectID", so we add the equals
        return `${this.projectHost}=${projectAsset.assetId}`;
    }
    setAssetHost(assetHost) {
        this.assetHost = assetHost;
    }
    getAssetGetConfig(asset) {
        if (!this.projectId) {
            return `https://assets.scratch.mit.edu/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;
        }

        return `${this.assetHost}/${this.projectId}_${asset.assetId}.${asset.dataFormat}`;
    }
    getAssetBackupGetConfig(asset) {
        if (!this.projectId) {
            return `https://assets.scratch.mit.edu/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;
        }

        return `https://projects.penguinmod.com/api/v1/projects/backupassetget?asset_name=${this.projectId}_${asset.assetId}.${asset.dataFormat}`;
    }
    getScratchAssetGetConfig(asset) {
        return `https://assets.scratch.mit.edu/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;
    }
    setTranslatorFunction(translator) {
        this.translator = translator;
        this.cacheDefaultProject();
    }
    cacheDefaultProject() {
        const defaultProjectAssets = defaultProject(this.translator);
        defaultProjectAssets.forEach((asset) =>
            this.builtinHelper._store(
                this.AssetType[asset.assetType],
                this.DataFormat[asset.dataFormat],
                asset.data,
                asset.id,
            ),
        );
        const missingProjectAssets = missingProject(this.translator);
        missingProjectAssets.forEach((asset) =>
            this.builtinHelper._store(
                this.AssetType[asset.assetType],
                this.DataFormat[asset.dataFormat],
                asset.data,
                asset.id,
            ),
        );
    }
}

const storage = new Storage();

export default storage;
