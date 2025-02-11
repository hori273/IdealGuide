sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
    "../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], (Controller, JSONModel, formatter, Filter, FilterOperator) => {
	"use strict";

	return Controller.extend("idealguidefe1.controller.InvoiceList", {
		formatter: formatter,
        
		async onInit() {
			const oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

			this.loadHousingModel();
		},

		async loadHousingModel(){
            var oModel = this.getOwnerComponent().getModel("catalog");
            var oGetRecommendedHousing = oModel.bindContext("/getRecommendedForUser(...)");

            await oGetRecommendedHousing.execute();

            var oResult = oGetRecommendedHousing.getBoundContext().getObject();

			var oRecommendedHousingModel = new JSONModel();
			oRecommendedHousingModel.setProperty("/HOUSING", JSON.parse(oResult.value))

            this.getView().setModel(oRecommendedHousingModel, "recommendedHousing");
        },

		onToggleModel() {
            if (this.bIsRecommendedModel) {
                this.getView().byId("invoiceList").setModel(this.getView().getModel());
            } else {
                this.getView().byId("invoiceList").setModel(this.getView().getModel("recommendedHousing"));
            }
            this.bIsRecommendedModel = !this.bIsRecommendedModel; 
        },

		onFilterInvoices(oEvent) {
			// build filter array
			const aFilter = [];
			const sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("NAME", FilterOperator.Contains, sQuery));
			}

			// filter binding
			const oList = this.byId("invoiceList");
			const oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},

		onPress(oEvent) {
			const oItem = oEvent.getSource();
			const oContext = oItem.getBindingContext();
			if (oContext) {
				const sPath = oContext.getPath();
				const oModel = oContext.getModel();
				const oData = oModel.getProperty(sPath);
		
				// Assuming the key for HOUSING is 'ID'
				const sKey = oData.ID;
		
				if (sKey) {
					const oRouter = this.getOwnerComponent().getRouter();
					oRouter.navTo("detail", {
						housingPath: window.encodeURIComponent(`HOUSING(${sKey})`)
					});
				} else {
					console.error("No key value found for the selected item.");
				}
			} else {
				console.error("No binding context found for the selected item.");
			}
		}		
		
	});
});