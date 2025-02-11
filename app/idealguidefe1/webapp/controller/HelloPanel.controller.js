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
                const oModel = this.getView().getModel("tutorialModel"); 
                const sRecipientName = oModel.getProperty("/recipient/name") || "Despre Medias";   

                const sPrompt = `${sRecipientName}`;
            
                $.getJSON("config.json")
                .done((config) => {
                    const sApiKey = config.OPENAI_API_KEY;
                
                    const oData = {
                        model: "gpt-4o-mini", //3.5-turbo
                        messages: [
                            { role: "user", content: sPrompt }
                        ]
                    };
            
                    $.ajax({
                        url: "https://api.openai.com/v1/chat/completions",
                        method: "POST",
                        contentType: "application/json",
                        headers: {
                            "Authorization": `Bearer ${sApiKey}` 
                        },
                        data: JSON.stringify(oData),
                        success: function (oResponse) {
                            const sResponseText = oResponse.choices && oResponse.choices[0].message.content;
                            
                            sap.m.MessageToast.show(sResponseText || "No response received");
                        },
                        error: function (err) {
                            console.error(err);
                            sap.m.MessageToast.show("Error calling OpenAI API");
                        }
                    });
                });
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
