sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("idealguidefe1.controller.HelloPanel", {
            onInit: function () {

            },
            onShowHello: function () {
                const oBundle = this.getView().getModel("i18n").getResourceBundle();
                const sRecipient = this.getView().getModel("tutorialModel").getProperty("/recipient/name");
                const sMsg = oBundle.getText("Hello " + sRecipient);
                sap.m.MessageToast.show(sMsg);
            },
            onOpenDialog: function() {
                this.pDialog ??= this.loadFragment({
                    name: "idealguidefe1.view.HelloDialog"
                });
            
                this.pDialog.then((oDialog) => oDialog.open());
            }, 
            onCloseDialog: function(){
                // note: We don't need to chain to the pDialog promise, since this event handler
                // is only called from within the loaded dialog itself.
                this.byId("helloDialog").close();
            }
        });
    });
