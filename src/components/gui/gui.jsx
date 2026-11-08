import classNames from 'classnames';
import omit from 'lodash.omit';
import PropTypes from 'prop-types';
import React from 'react';
import Draggable from "react-draggable";
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import MediaQuery from 'react-responsive';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import tabStyles from 'react-tabs/style/react-tabs.css';
import VM from 'scratch-vm';
import Renderer from 'scratch-render';

import Blocks from '../../containers/blocks.jsx';
import CostumeTab from '../../containers/costume-tab.jsx';
import TargetPane from '../../containers/target-pane.jsx';
import SoundTab from '../../containers/sound-tab.jsx';
import VariablesTab from '../../containers/variables-tab.jsx';
import FilesTab from '../../containers/files-tab.jsx';
import StageWrapper from '../../containers/stage-wrapper.jsx';
import Loader from '../loader/loader.jsx';
import Box from '../box/box.jsx';
import MenuBar from '../menu-bar/menu-bar.jsx';
import CostumeLibrary from '../../containers/costume-library.jsx';
import BackdropLibrary from '../../containers/backdrop-library.jsx';
import Watermark from '../../containers/watermark.jsx';

import Backpack from '../../containers/backpack.jsx';
import BrowserModal from '../browser-modal/browser-modal.jsx';
import TipsLibrary from '../../containers/tips-library.jsx';
import Cards from '../../containers/cards.jsx';
import Alerts from '../../containers/alerts.jsx';
import DragLayer from '../../containers/drag-layer.jsx';
import TelemetryModal from '../telemetry-modal/telemetry-modal.jsx';
import TWUsernameModal from '../../containers/tw-username-modal.jsx';
import TWSettingsModal from '../../containers/tw-settings-modal.jsx';
import TWSecurityManager from '../../containers/tw-security-manager.jsx';
import TWRestorePointManager from '../../containers/tw-restore-point-manager.jsx';
import TWFontsModal from '../../containers/tw-fonts-modal.jsx';
import PMProfilerModal from '../pm-profiler/pm-profiler-modal.jsx';
import PMExtensionModals from '../../containers/pm-extension-modals.jsx';

import layout, {STAGE_SIZE_MODES} from '../../lib/layout-constants';
import {resolveStageSize} from '../../lib/screen-utils';
import StageResizeHandle from '../stage-resize-handle/stage-resize-handle.jsx';

import {isRendererSupported, isBrowserSupported} from '../../lib/tw-environment-support-prober';

import styles from './gui.css';
import codeIcon from './icon--code.svg';
import costumesIcon from './icon--costumes.svg';
import soundsIcon from './icon--sounds.svg';
import variablesIcon from './icon--variables.svg';

const urlParams = new URLSearchParams(location.search);

const IsLocal = String(window.location.href).startsWith(`http://localhost:`);
const IsLiveTests = urlParams.has('livetests');

const messages = defineMessages({
    addExtension: {
        id: 'gui.gui.addExtension',
        description: 'Button to add an extension in the target pane',
        defaultMessage: 'Add Extension'
    }
});

const getFullscreenBackgroundColor = () => {
    const params = new URLSearchParams(location.search);
    if (params.has('fullscreen-background')) {
        return params.get('fullscreen-background');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return '#111';
    }
    return 'white';
};

const fullscreenBackgroundColor = getFullscreenBackgroundColor();

const GUIComponent = props => {
    const {
        accountNavOpen,
        activeTabIndex,
        alertsVisible,
        authorId,
        authorThumbnailUrl,
        authorUsername,
        basePath,
        backdropLibraryVisible,
        backpackHost,
        backpackVisible,
        blocksTabVisible,
        cardsVisible,
        canChangeLanguage,
        canCreateNew,
        canEditTitle,
        canManageFiles,
        canRemix,
        canSave,
        canCreateCopy,
        canShare,
        canUseCloud,
        children,
        costumeLibraryVisible,
        costumesTabVisible,
        customStageSize,
        enableCommunity,
        intl,
        isCreating,
        isDark,
        isEmbedded,
        isFullScreen,
        isPlayerOnly,
        isRtl,
        isShared,
        isWindowFullScreen,
        isTelemetryEnabled,
        loading,
        logo,
        renderLogin,
        onClickAbout,
        onClickAccountNav,
        onCloseAccountNav,
        onClickAddonSettings,
        onClickNewWindow,
        onClickTheme,
        onClickPackager,
        onLogOut,
        onOpenRegistration,
        onToggleLoginOpen,
        onActivateCostumesTab,
        onActivateSoundsTab,
        onActivateVariablesTab,
        onActivateFilesTab,
        onActivateTab,
        onClickLogo,
        onExtensionButtonClick,
        onProjectTelemetryEvent,
        onRequestCloseBackdropLibrary,
        onRequestCloseCostumeLibrary,
        onRequestCloseTelemetryModal,
        onSeeCommunity,
        onShare,
        onShowPrivacyPolicy,
        onStartSelectingFileUpload,
        onStartFolderUpload,
        onTelemetryModalCancel,
        onTelemetryModalOptIn,
        onTelemetryModalOptOut,
        showComingSoon,
        soundsTabVisible,
        variablesTabVisible,
        filesTabVisible,
        stageSizeMode,
        targetIsStage,
        telemetryModalVisible,
        tipsLibraryVisible,
        usernameModalVisible,
        settingsModalVisible,
        fontsModalVisible,
        profilerModalVisible,
        isPlayground,
        vm,
        ...componentProps
    } = omit(props, 'dispatch');
    if (children) {
        return <Box {...componentProps}>{children}</Box>;
    }

    const tabClassNames = {
        tabs: styles.tabs,
        tab: classNames(tabStyles.reactTabsTab, styles.tab),
        tabList: classNames(tabStyles.reactTabsTabList, styles.tabList),
        tabPanel: classNames(tabStyles.reactTabsTabPanel, styles.tabPanel),
        tabPanelSelected: classNames(tabStyles.reactTabsTabPanelSelected, styles.isSelected),
        tabSelected: classNames(tabStyles.reactTabsTabSelected, styles.isSelected)
    };

    // PMDESKTOP_TABS: the Code, Costumes, Sounds and Variables tabs are always there (no "+" button,
    // no right-click "delete"). An extension that adds a tab of its own (Scenes) puts it after them.
    const organizedTabs = [
        <Tab
            className={tabClassNames.tab}
            key="code"
        >
            <img
                draggable={false}
                src={codeIcon}
            />
            <span className={styles.tabLabel}>
                <FormattedMessage
                    defaultMessage="Code"
                    description="Button to get to the code panel"
                    id="gui.gui.codeTab"
                />
            </span>
        </Tab>,
        <Tab
            className={tabClassNames.tab}
            key="costume"
            onClick={onActivateCostumesTab}
        >
            <img
                draggable={false}
                src={costumesIcon}
            />
            <span className={styles.tabLabel}>
                {targetIsStage ? (
                    <FormattedMessage
                        defaultMessage="Backdrops"
                        description="Button to get to the backdrops panel"
                        id="gui.gui.backdropsTab"
                    />
                ) : (
                    <FormattedMessage
                        defaultMessage="Costumes"
                        description="Button to get to the costumes panel"
                        id="gui.gui.costumesTab"
                    />
                )}
            </span>
        </Tab>,
        <Tab
            className={tabClassNames.tab}
            key="sound"
            onClick={onActivateSoundsTab}
        >
            <img
                draggable={false}
                src={soundsIcon}
            />
            <span className={styles.tabLabel}>
                <FormattedMessage
                    defaultMessage="Sounds"
                    description="Button to get to the sounds panel"
                    id="gui.gui.soundsTab"
                />
            </span>
        </Tab>,
        <Tab
            className={tabClassNames.tab}
            key="variable"
            onClick={onActivateVariablesTab}
        >
            <img
                draggable={false}
                src={variablesIcon}
            />
            <span className={styles.tabLabel}>
                <FormattedMessage
                    defaultMessage="Variables"
                    description="Button to get to the variables panel"
                    id="pm.gui.variablesTab"
                />
            </span>
        </Tab>
    ];

    const minWidth = layout.fullSizeMinWidth + Math.max(0, customStageSize.width - layout.referenceWidth);
    return (<MediaQuery minWidth={minWidth}>{isFullSize => {
        const stageSize = resolveStageSize(stageSizeMode, isFullSize);

        const alwaysEnabledModals = (
            <React.Fragment>
                <TWSecurityManager />
                <TWRestorePointManager />
                {usernameModalVisible && <TWUsernameModal />}
                {settingsModalVisible && <TWSettingsModal />}
                {fontsModalVisible && <TWFontsModal />}
                {profilerModalVisible && <PMProfilerModal vm={vm} />}
                <PMExtensionModals vm={vm} />
            </React.Fragment>
        );

        return isPlayerOnly ? (
            <React.Fragment>
                {/* TW: When the window is fullscreen, use an element to display the background color */}
                {/* The default color for transparency is inconsistent between browsers and there isn't an existing */}
                {/* element for us to style that fills the entire screen. */}
                {isWindowFullScreen ? (
                    <div
                        className={styles.fullscreenBackground}
                        style={{
                            backgroundColor: fullscreenBackgroundColor
                        }}
                    />
                ) : null}
                <StageWrapper
                    isFullScreen={isFullScreen}
                    isEmbedded={isEmbedded}
                    isRendererSupported={isRendererSupported()}
                    isRtl={isRtl}
                    loading={loading}
                    stageSize={STAGE_SIZE_MODES.large}
                    vm={vm}
                >
                    {alertsVisible ? (
                        <Alerts className={styles.alertsContainer} />
                    ) : null}
                </StageWrapper>
                {alwaysEnabledModals}
            </React.Fragment>
        ) : (
            <Box
                className={styles.pageWrapper}
                dir={isRtl ? 'rtl' : 'ltr'}
                {...componentProps}
            >
                {alwaysEnabledModals}
                {telemetryModalVisible ? (
                    <TelemetryModal
                        isRtl={isRtl}
                        isTelemetryEnabled={isTelemetryEnabled}
                        onCancel={onTelemetryModalCancel}
                        onOptIn={onTelemetryModalOptIn}
                        onOptOut={onTelemetryModalOptOut}
                        onRequestClose={onRequestCloseTelemetryModal}
                        onShowPrivacyPolicy={onShowPrivacyPolicy}
                    />
                ) : null}
                {loading ? (
                    <Loader isFullScreen />
                ) : null}
                {isCreating ? (
                    <Loader
                        isFullScreen
                        messageId={isPlayground ? "pm.loader.playground" : "gui.loader.creating"}
                    />
                ) : null}
                {isBrowserSupported() ? null : (
                    <BrowserModal isRtl={isRtl} />
                )}
                {tipsLibraryVisible ? (
                    <TipsLibrary />
                ) : null}
                {cardsVisible ? (
                    <Cards />
                ) : null}
                {alertsVisible ? (
                    <Alerts className={styles.alertsContainer} />
                ) : null}
                {costumeLibraryVisible ? (
                    <CostumeLibrary
                        vm={vm}
                        onRequestClose={onRequestCloseCostumeLibrary}
                    />
                ) : null}
                {backdropLibraryVisible ? (
                    <BackdropLibrary
                        vm={vm}
                        onRequestClose={onRequestCloseBackdropLibrary}
                    />
                ) : null}
                {(!isPlayground) ? (
                    <MenuBar
                        accountNavOpen={accountNavOpen}
                        authorId={authorId}
                        authorThumbnailUrl={authorThumbnailUrl}
                        authorUsername={authorUsername}
                        canChangeLanguage={canChangeLanguage}
                        canCreateCopy={canCreateCopy}
                        canCreateNew={canCreateNew}
                        canEditTitle={canEditTitle}
                        canManageFiles={canManageFiles}
                        canRemix={canRemix}
                        canSave={canSave}
                        canShare={canShare}
                        className={styles.menuBarPosition}
                        enableCommunity={enableCommunity}
                        isDirectoryPickerSupported={!!window.showDirectoryPicker}
                        isShared={isShared}
                        logo={logo}
                        renderLogin={renderLogin}
                        showComingSoon={showComingSoon}
                        onClickAbout={onClickAbout}
                        onClickAccountNav={onClickAccountNav}
                        onClickAddonSettings={onClickAddonSettings}
                        onClickNewWindow={onClickNewWindow}
                        onClickTheme={onClickTheme}
                        onClickPackager={onClickPackager}
                        onClickLogo={onClickLogo}
                        onCloseAccountNav={onCloseAccountNav}
                        onLogOut={onLogOut}
                        onOpenRegistration={onOpenRegistration}
                        onProjectTelemetryEvent={onProjectTelemetryEvent}
                        onSeeCommunity={onSeeCommunity}
                        onShare={onShare}
                        onStartSelectingFileUpload={onStartSelectingFileUpload}
                        onStartFolderUpload={onStartFolderUpload}
                        onToggleLoginOpen={onToggleLoginOpen}
                    />
                ) : null}
                <Box className={classNames(styles.bodyWrapper, isPlayground ? styles.bodyWrapperPlayground : null)}>
                    <Box className={styles.flexWrapper}>
                        <Box className={styles.editorWrapper}>
                            <Tabs
                                forceRenderTabPanel
                                className={tabClassNames.tabs}
                                selectedIndex={activeTabIndex}
                                selectedTabClassName={tabClassNames.tabSelected}
                                selectedTabPanelClassName={tabClassNames.tabPanelSelected}
                                onSelect={onActivateTab}
                            >
                                <TabList className={tabClassNames.tabList}>
                                    {organizedTabs}


                                    <div id="sa_addons_after_add_tab_anchor" />
                                </TabList>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    <Box className={styles.blocksWrapper}>
                                        <Blocks
                                            canUseCloud={canUseCloud}
                                            grow={1}
                                            isVisible={blocksTabVisible}
                                            options={{
                                                media: `${basePath}static/blocks-media/`
                                            }}
                                            stageSize={stageSize}
                                            vm={vm}
                                        />
                                    </Box>
                                    <Box className={styles.extensionButtonContainer}>
                                        <button
                                            className={styles.extensionButton}
                                            title={intl.formatMessage(messages.addExtension)}
                                            onClick={onExtensionButtonClick}
                                        >
                                            ADD
                                        </button>
                                    </Box>
                                    <Box className={styles.watermark}>
                                        <Watermark />
                                    </Box>
                                </TabPanel>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    {costumesTabVisible ? <CostumeTab
                                        vm={vm}
                                        isDark={isDark}
                                    /> : null}
                                </TabPanel>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    {soundsTabVisible ? <SoundTab vm={vm} /> : null}
                                </TabPanel>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    {variablesTabVisible ? <VariablesTab vm={vm} /> : null}
                                </TabPanel>
                            </Tabs>
                            {backpackVisible ? (
                                <Backpack host={backpackHost} />
                            ) : null}
                        </Box>

                        <Box className={classNames(styles.stageAndTargetWrapper, styles[stageSize])}>
                            <StageResizeHandle isRtl={isRtl} />
                            <StageWrapper
                                isFullScreen={isFullScreen}
                                isRendererSupported={isRendererSupported()}
                                isRtl={isRtl}
                                stageSize={stageSize}
                                vm={vm}
                            />
                            <Box className={styles.targetWrapper}>
                                <TargetPane
                                    stageSize={stageSize}
                                    vm={vm}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <DragLayer />
            </Box>
        );
    }}</MediaQuery>);
};

GUIComponent.propTypes = {
    accountNavOpen: PropTypes.bool,
    activeTabIndex: PropTypes.number,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
    backdropLibraryVisible: PropTypes.bool,
    backpackHost: PropTypes.string,
    backpackVisible: PropTypes.bool,
    basePath: PropTypes.string,
    blocksTabVisible: PropTypes.bool,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    canUseCloud: PropTypes.bool,
    cardsVisible: PropTypes.bool,
    children: PropTypes.node,
    costumeLibraryVisible: PropTypes.bool,
    costumesTabVisible: PropTypes.bool,
    customStageSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    enableCommunity: PropTypes.bool,
    intl: intlShape.isRequired,
    isCreating: PropTypes.bool,
    isDark: PropTypes.bool,
    isEmbedded: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isWindowFullScreen: PropTypes.bool,
    loading: PropTypes.bool,
    logo: PropTypes.string,
    onActivateCostumesTab: PropTypes.func,
    onActivateSoundsTab: PropTypes.func,
    onActivateVariablesTab: PropTypes.func,
    onActivateFilesTab: PropTypes.func,
    onActivateTab: PropTypes.func,
    onClickAccountNav: PropTypes.func,
    onClickAddonSettings: PropTypes.func,
    onClickNewWindow: PropTypes.func,
    onClickTheme: PropTypes.func,
    onClickPackager: PropTypes.func,
    onClickLogo: PropTypes.func,
    onCloseAccountNav: PropTypes.func,
    onExtensionButtonClick: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onRequestCloseBackdropLibrary: PropTypes.func,
    onRequestCloseCostumeLibrary: PropTypes.func,
    onRequestCloseTelemetryModal: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onShowPrivacyPolicy: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    onStartFolderUpload: PropTypes.func,
    onTabSelect: PropTypes.func,
    onTelemetryModalCancel: PropTypes.func,
    onTelemetryModalOptIn: PropTypes.func,
    onTelemetryModalOptOut: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    renderLogin: PropTypes.func,
    showComingSoon: PropTypes.bool,
    soundsTabVisible: PropTypes.bool,
    variablesTabVisible: PropTypes.bool,
    filesTabVisible: PropTypes.bool,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    targetIsStage: PropTypes.bool,
    telemetryModalVisible: PropTypes.bool,
    tipsLibraryVisible: PropTypes.bool,
    usernameModalVisible: PropTypes.bool,
    settingsModalVisible: PropTypes.bool,
    fontsModalVisible: PropTypes.bool,
    profilerModalVisible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};
GUIComponent.defaultProps = {
    backpackHost: null,
    backpackVisible: false,
    basePath: './',
    canChangeLanguage: true,
    canCreateNew: false,
    canEditTitle: false,
    canManageFiles: true,
    canRemix: false,
    canSave: false,
    canCreateCopy: false,
    canShare: false,
    canUseCloud: false,
    enableCommunity: false,
    isCreating: false,
    isShared: false,
    loading: false,
    showComingSoon: false,
    stageSizeMode: STAGE_SIZE_MODES.large
};

const mapStateToProps = state => ({
    customStageSize: state.scratchGui.customStageSize,
    isWindowFullScreen: state.scratchGui.tw.isWindowFullScreen,
    // This is the button's mode, as opposed to the actual current state
    stageSizeMode: state.scratchGui.stageSize.stageSize
});

export default injectIntl(connect(
    mapStateToProps
)(GUIComponent));
