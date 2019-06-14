//#region interfaces
import { utils,
         logging,
         directives }           from "./node_modules/davinci.js/dist/umd/daVinci";
import * as template            from "text!./q2g-ext-scrambleDirective.html";
//#endregion

//#region interfaces
export interface IShortcutProperties {
    shortcutFocusFieldList: string;
    shortcutFocusSearchField: string;
    shortcutUseDefaults: string;
    showHidden: boolean;
}
//#endregion

class ScrambleController {

    $onInit(): void {
        this.logger.debug("initialisation from BookmarkController");
    }

    //#region variables
    actionDelay: number = 0;
    fieldList: utils.IQ2gListAdapter;
    editMode: boolean;
    element: JQuery;
    focusedPosition: number = 0;
    headerPlaceholder: string = "Search Dimensions";
    inputBarFocus: boolean = false;
    menuList: Array<utils.IMenuElement>;
    properties: IShortcutProperties = {
        shortcutFocusFieldList: " ",
        shortcutFocusSearchField: " ",
        shortcutUseDefaults: " ",
        showHidden: false,
    };
    showButtons: boolean = false;
    showFocused: boolean = true;
    showSearchField: boolean = false;
    timeout: ng.ITimeoutService;
    titleDimension: string = "Scramble Extension";
    selectedObjects: Array<string> = [];
    //#endregion

    //#region headerInput
    private _headerInput: string = "";
    public get headerInput(): string {
        return this._headerInput;
    }
    public set headerInput(v : string) {
        if (v !== this._headerInput) {
            try {
                this._headerInput = v;
                this.fieldList.obj.searchFor(!v? "": v)
                .then(() => {
                    this.fieldList.obj.emit("changed", this.fieldList.itemsPagingHeight);
                    this.fieldList.itemsCounter = (this.fieldList.obj as any).model.calcCube.length;
                    this.timeout();
                })
                .catch((error) => {
                    this.logger.error("error", error);
                });
            } catch (error) {
                this.logger.error("ERROR", error);
            }
        }
    }
    //#endregion

    //#region elementHeight
    private _elementHeight: number = 0;
    get elementHeight(): number {
        return this._elementHeight;
    }
    set elementHeight(value: number) {
        if (this.elementHeight !== value) {
            try {
                this._elementHeight = value;
            } catch (err) {
                this.logger.error("error in setter of elementHeight ", err);
            }
        }
    }
    //#endregion

    //#region model
    private _model: EngineAPI.IGenericObject;
    get model(): EngineAPI.IGenericObject {
        return this._model;
    }
    set model(value: EngineAPI.IGenericObject) {
        if (value !== this._model) {
            try {
                this._model = value;
                let properites: EngineAPI.IGenericObjectProperties;
                let that = this;
                this.model.on("changed", function() {
                    that.model.getProperties()
                    .then((res) => {
                        properites = that.buildListProperties(res.properties);
                        return that.setProperties(res.properties);
                    })
                    .then(() => {
                        return that.model.app.createSessionObject(properites);
                    })
                    .then((object: EngineAPI.IGenericObject) => {
                        object.on("changed", function () {
                            this.getLayout()
                            .then((objectLayout: EngineAPI.IGenericHyperCubeLayout) => {
                                let listObject = new utils.Q2gIndObject(
                                    new utils.AssistHyperCubeFields(objectLayout));

                                listObject.on("changeData", () => {
                                    for (var i of that.fieldList.collection) {
                                        if (that.selectedObjects.indexOf(i.title) >= 0) {
                                            i.status = "S";
                                            that.timeout();
                                        }
                                    }
                                });

                                that.fieldList = new utils.Q2gListAdapter(
                                    listObject, that.fieldList.itemsPagingHeight,
                                    (objectLayout as any).qFieldList.qItems.length, "list");
                            })
                            .catch((error) => {
                                this.logger.error("Error in on change of bookmark object", error);
                            });
                        });
                        object.emit("changed");
                    })
                    .catch((error) => {
                        this.logger.error("ERROR in setter of model", error);
                    });
                });
                this.model.emit("changed");
            } catch (error) {
                this.logger.error("ERROR in setter of model", error);
            }
        }
    }
    //#endregion

    //#region theme
    private _theme: string;
    get theme(): string {
        if (this._theme) {
            return this._theme;
        }
        return "default";
    }
    set theme(value: string) {
        if (value !== this._theme) {
            this._theme = value;
        }
    }
    //#endregion

    //#region logger
    private _logger: logging.Logger;
    private get logger(): logging.Logger {
        if (!this._logger) {
            try {
                this._logger = new logging.Logger("BookmarkController");
            } catch (e) {
                this.logger.error("ERROR in create logger instance", e);
            }
        }
        return this._logger;
    }
    //#endregion

    static $inject = ["$timeout", "$element", "$scope"];

    /**
     * init of the controller for the Directive
     * @param timeout
     * @param element
     */
    constructor (timeout: ng.ITimeoutService, element: JQuery, scope: ng.IScope) {

        this.element = element;
        this.timeout = timeout;

        this.initMenuElements();

        $(document).on("click", (e: JQueryEventObject) => {
            try {
                if (element.find(e.target).length === 0) {
                    this.showFocused = false;
                    this.showButtons = false;
                    this.showSearchField = false;
                    this.headerInput= null;
                    this.selectedObjects = [];
                    this.timeout();
                }
            } catch (e) {
                this.logger.error("Error in Constructor with click event", e);
            }
        });

        scope.$watch(() => {
            return this.element.width();
        }, () => {
            this.elementHeight = this.element.height();
        });
    }

    /**
     * saves the Properties from the getLayout call from qlik enine in own Object
     * @param properties Properties from getLayout call
     */
    private setProperties(properties: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.properties.shortcutFocusFieldList = properties.shortcutFocusFieldList;
            this.properties.shortcutFocusSearchField = properties.shortcutFocusSearchField;
            this.properties.shortcutUseDefaults = properties.shortcutUseDefaults;
            this.properties.showHidden = properties.showHidden;
            resolve();
        });
    }

    /**
     * function which gets called, when the buttons of the menu list gets hit
     * @param item name of the button which got activated
     */
    async menuListActionCallback(): Promise<void> {
        let arr: Promise<void>[] = [];
        for(var field of this.selectedObjects) {
            arr.push(this.model.app.scramble(field));
        }

        await Promise.all(arr);
        await this.model.app.doSave();
        this.menuList[0].isEnabled = false;
        this.menuList = JSON.parse(JSON.stringify(this.menuList));
        this.selectedObjects = [];
    }

    /**
     * functionsality when selecting an element in the list
     * @param pos position of the callback to be selected
     */
    selectObjectCallback(pos: number) {
        setTimeout(() => {

            let checkIfFildAlreadyInList: boolean = false;
            let counter: number = 0;

            this.showFocused = true;
            this.showButtons = true;
            this.menuList[0].isEnabled = false;
            this.focusedPosition = pos + this.fieldList.itemsPagingTop;

            for (const field of this.selectedObjects) {
                if (field === this.fieldList.collection[pos].title) {
                    checkIfFildAlreadyInList = true;

                    this.selectedObjects.splice(counter, 1);

                    this.fieldList.collection[pos].status = "O";
                }
                counter++;
            }

            if (!checkIfFildAlreadyInList) {

                this.selectedObjects.push(this.fieldList.collection[pos].title);
                this.fieldList.collection[pos].status = "S";
            }

            this.menuList = JSON.parse(JSON.stringify(this.menuList));
            this.timeout();

        }, this.actionDelay);
    }

    /**
     * shortcuthandler to clears the made selection
     * @param objectShortcut object wich gives you the shortcut name and the element, from which the shortcut come from
     */
    shortcutHandler(shortcutObject: directives.IShortcutObject, domcontainer: utils.IDomContainer): boolean {
        switch (shortcutObject.name) {
            case "escAltState":
                try {
                    if (this.headerInput === "") {
                        this.showSearchField = false;
                    }
                    return true;
                } catch (e) {
                    this.logger.error("Error in shortcutHandlerExtensionHeader", e);
                    return false;
                }

            case "searchFields":
                try {
                    this.showSearchField = true;
                    this.timeout();
                    domcontainer.element.focus();
                    return true;
                } catch (e) {
                    this.logger.error("Error in shortcut Handler", e);
                    return false;
                }
            case "focusList":
                try {
                    this.showFocused = true;
                    this.timeout();
                    if (this.focusedPosition < 0 || this.focusedPosition >= this.fieldList.collection.length) {
                        this.focusedPosition = 0;
                        domcontainer.element.children().children().children()[0].focus();
                        this.timeout();
                        this.showSearchField = false;
                        return true;
                    }

                    if (this.focusedPosition < this.fieldList.itemsPagingTop) {
                        this.fieldList.itemsPagingTop = this.focusedPosition;
                    } else if (this.focusedPosition >
                        this.fieldList.itemsPagingTop + this.fieldList.itemsPagingHeight) {
                        this.fieldList.itemsPagingTop
                            = this.focusedPosition - (this.fieldList.itemsPagingHeight + 1);
                    }
                    domcontainer.element.children().children().children().children()[
                        this.focusedPosition - this.fieldList.itemsPagingTop
                    ].focus();
                    this.showSearchField = false;
                    return true;
                } catch (e) {
                    this.logger.error("Error in shortcut Handler", e);
                    return false;
                }
        }
    }

    /**
     * checks if the extension is used in Edit mode
     */
    isEditMode(): boolean {
        if (this.editMode) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * fills the Menu with Elements
     */
    private initMenuElements(): void {
        this.menuList = [];
        this.menuList.push({
            buttonType: "success",
            isVisible: true,
            isEnabled: true,
            icon: "tick",
            name: "Confirm Selection",
            hasSeparator: false,
            type: "menu"
        });
    }

    /**
     * creates the definition for the object
     * @param properties
     */
    private buildListProperties(properties: EngineAPI.IGenericObjectProperties): EngineAPI.IGenericObjectProperties {
        let returnProperties: EngineAPI.IGenericObjectProperties = {
            "qInfo": { "qType": "FieldList" },
            "qFieldListDef": {
                "qShowSystem": properties.showSystem,
                "qShowHidden": properties.showHidden,
                "qShowSemantic": properties.showSemantic,
                "qShowSrcTables": properties.showSrcTables,
                "qShowDefinitionOnly": properties.showDefinitionOnly,
                "qShowDerivedFields": properties.showDerivedFields,
                "qShowImplicit": properties.showImplicit
            }
        };
        return returnProperties;
    }
}

export function ScrambleDirectiveFactory(rootNameSpace: string): ng.IDirectiveFactory {
    "use strict";
    return ($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
        return {
            restrict: "E",
            replace: true,
            template: utils.templateReplacer(template, rootNameSpace),
            controller: ScrambleController,
            controllerAs: "vm",
            scope: {},
            bindToController: {
                model: "<",
                theme: "<?",
                editMode: "<?"
            },
            compile: ():void => {
                utils.checkDirectiveIsRegistrated($injector, $registrationProvider, rootNameSpace,
                    directives.ListViewDirectiveFactory(rootNameSpace), "Listview");
                utils.checkDirectiveIsRegistrated($injector, $registrationProvider, rootNameSpace,
                    directives.ExtensionHeaderDirectiveFactory(rootNameSpace), "ExtensionHeader");
                utils.checkDirectiveIsRegistrated($injector, $registrationProvider, rootNameSpace,
                    directives.ShortCutDirectiveFactory(rootNameSpace), "Shortcut");
            }
        };
    };
}
