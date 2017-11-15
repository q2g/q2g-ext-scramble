//#region imports
import * as qvangular from "qvangular";
import * as qlik from "qlik";
import * as template from "text!./q2g-ext-scramble.html";
import { utils, logging, services, version } from "../node_modules/davinci.js/dist/daVinci";
import { ScrambleDirectiveFactory, IShortcutProperties } from "./q2g-ext-scrambledimensionExtension";
//#endregion

//#region registrate services
qvangular.service<services.IRegistrationProvider>("$registrationProvider", services.RegistrationProvider)
.implementObject(qvangular);
//#endregion

//#region interfaces
interface IDataProperties {
    properties: IShortcutProperties;
}
//#endregion

//#region logger
logging.LogConfig.SetLogLevel("*", logging.LogLevel.info);
let logger = new logging.Logger("Main");
//#endregion

//#region registrate directives
var $injector = qvangular.$injector;
utils.checkDirectiveIsRegistrated($injector, qvangular, "", ScrambleDirectiveFactory("Scrambleextension"),
    "ScrambleExtension");
//#endregion

//#region set extension parameters
let parameter = {
    type: "items",
    component: "accordion",
    items: {
        settings: {
            uses: "settings",
            items: {
                configuration: {
                    type: "items",
                    label: "Configuration",
                    grouped: true,
                    items: {
                        qShowSystem: {
                            type: "boolean",
                            label: "Show System Fields",
                            ref: "properties.showSystem",
                            defaultValue: false
                        },
                        qShowHidden: {
                            type: "boolean",
                            label: "Show Hidden Fields",
                            ref: "properties.showHidden",
                            defaultValue: false
                        },
                        qShowSemantic: {
                            type: "boolean",
                            label: "Show Semantic Fields",
                            ref: "properties.showSemantic",
                            defaultValue: false
                        },
                        qShowSrcTables: {
                            type: "boolean",
                            label: "Show Sourc Table Fields",
                            ref: "properties.showSrcTables",
                            defaultValue: true
                        },
                        qShowDefinitionOnly: {
                            type: "boolean",
                            label: "Show Fields defined on the Fly",
                            ref: "properties.showDefinitionOnly",
                            defaultValue: false
                        },
                        qShowDerivedFields: {
                            type: "boolean",
                            label: "Show Deroved Fields",
                            ref: "properties.showDerivedFields",
                            defaultValue: false
                        },
                        qShowImplicit: {
                            type: "boolean",
                            label: "Show Direct Discovery Fields",
                            ref: "properties.showImplicit",
                            defaultValue: false
                        }
                    }
                },
                accessibility: {
                    type: "items",
                    label: "Accessibility",
                    grouped: true,
                    items: {
                        ShortcutLable: {
                            label: "In the following, you can change the used shortcuts",
                            component: "text"
                        },
                        shortcutUseDefaults: {
                            ref: "properties.shortcutUseDefaults",
                            label: "use default shortcuts",
                            component: "switch",
                            type: "boolean",
                            options: [{
                                value: true,
                                label: "use"
                            }, {
                                value: false,
                                label: "not use"
                            }],
                            defaultValue: true
                        },
                        shortcutFocusDimensionList: {
                            ref: "properties.shortcutFocusDimensionList",
                            label: "focus dimension list",
                            type: "string",
                            defaultValue: "strg + alt + 66",
                            show: function (data: IDataProperties) {
                                if (data.properties.shortcutUseDefaults) {
                                    data.properties.shortcutFocusDimensionList = "strg + alt + 66";
                                }
                                return !data.properties.shortcutUseDefaults;
                            }
                        },
                        shortcutFocusSearchField: {
                            ref: "properties.shortcutFocusSearchField",
                            label: "focus search field",
                            type: "string",
                            defaultValue: "strg + alt + 83",
                            show: function (data: IDataProperties) {
                                if (data.properties.shortcutUseDefaults) {
                                    data.properties.shortcutFocusSearchField = "strg + alt + 83";
                                }
                                return !data.properties.shortcutUseDefaults;
                            }
                        }
                    }
                }
            }
        }
    }
};
//#endregion

class ScrambleDimensionExtension {

    model: EngineAPI.IGenericObject;

    constructor(model: EngineAPI.IGenericObject) {
        this.model = model;
    }

    public isEditMode() {
        if (qlik.navigation.getMode() === "analysis") {
            return false;
        } else {
            return true;
        }
    }
}

export = {
    definition: parameter,
    initialProperties: { },
    template: template,
    controller: ["$scope", function (scope: utils.IVMScope<ScrambleDimensionExtension>) {
        console.log("Extension is using daVinci Verions: " + version);
        scope.vm = new ScrambleDimensionExtension(utils.getEnigma(scope));
    }]
};


