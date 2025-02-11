sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "myreservations/model/formatter",
    "sap/m/MessageBox"
], (Controller, JSONModel, Filter, FilterOperator, formatter, MessageBox) => {
    "use strict";

    return Controller.extend("myreservations.controller.Reservations", {
        formatter: formatter,
        
        async onInit() {
            const oViewModel = new JSONModel({
                currency: "EUR"
            });
            this.getView().setModel(oViewModel, "view");

            this.cleanUpOldReservations();
            this.updateCompletedReservations();
            this.loadReservationsModel();
        },

        async cleanUpOldReservations(){
            const oModel = this.getOwnerComponent().getModel("catalog");
            const oGetReservations = oModel.bindContext("/cleanUpOldReservations(...)");
            await oGetReservations.execute();
        },

        async updateCompletedReservations(){
            const oModel = this.getOwnerComponent().getModel("catalog");
            const oGetReservations = oModel.bindContext("/updateCompletedReservations(...)");
            await oGetReservations.execute();
        },

        async loadReservationsModel() {
            const oModel = this.getOwnerComponent().getModel("catalog");
            const oGetReservations = oModel.bindContext("/getAllReservationsByUser(...)");

            oGetReservations.setParameter("userEmail", "andrei.kalman@nttdata.com");

            await oGetReservations.execute();

            const oResult = oGetReservations.getBoundContext().getObject();

            const oReservationsModel = new JSONModel();
            oReservationsModel.setProperty("/HOUSING_RESERVATIONS", JSON.parse(oResult.value))

            this.getView().setModel(oReservationsModel, "reservations");
            this.getView().byId("reservationList").setModel(this.getView().getModel("reservations"));
        },

        onFilterReservations(oEvent) {
            // build filter array
            const aFilter = [];
            const sQuery = oEvent.getParameter("query");
            if (sQuery) {
                aFilter.push(new Filter("PLACE_ID_ID", FilterOperator.Contains, sQuery));
            }

            // filter binding
            const oList = this.byId("reservationList");
            const oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
        },

        onDeleteReservation(oEvent) {
            const oButton = oEvent.getSource();
            const sPlaceId = oButton.getCustomData().find(data => data.getKey() === "reservationId").getValue();

            MessageBox.confirm(`Are you sure you want to cancel the reservation with ID: ${sPlaceId}?`, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: async (oAction) => {
                    if (oAction === MessageBox.Action.YES) {
                        await this._cancelReservation(sPlaceId);
                    }
                }
            });
        },

        async _cancelReservation(sPlaceId) {
            const oModel = this.getOwnerComponent().getModel("catalog");

            try {
                const oContext = oModel.bindContext("/cancelReservationHousing(...)");
                oContext.setParameter("placeId", sPlaceId);

                await oContext.execute();

                MessageBox.success(`Reservation for place ID: ${sPlaceId} has been successfully cancelled.`);
                
                // Reload reservations model to reflect changes
                await this.loadReservationsModel();
            } catch (error) {
                MessageBox.error(`Failed to cancel reservation: ${error.message}`);
                console.error("Error cancelling reservation:", error);
            }
        },

        async isFeedbackAvailable(id){
            const oModel = this.getOwnerComponent().getModel("catalog");

            try {
                const oContext = oModel.bindContext("/isHousingReservationRated(...)");
                oContext.setParameter("reservationId", id);

                await oContext.execute();
                const oResult = oGetReservations.getBoundContext().getObject();

                return !oResult.value;
            } catch (error) {
                console.error("Error checking feedback availability:", error);
                return false;
            }
        },

        onPress(oEvent) {
			const oItem = oEvent.getSource();
			const oContext = oItem.getBindingContext();
			if (oContext) {
				const sPath = oContext.getPath();
				const oModel = oContext.getModel();
				const oData = oModel.getProperty(sPath);
		
				// Assuming the key for reservation is 'ID'
				const sKey = oData.ID;
                const sPlaceId = oData.PLACE_ID_ID;
                const sDateTime = oData.DATE_TIME;
		
				if (sKey) {
					const oRouter = this.getOwnerComponent().getRouter();
					oRouter.navTo("detail", {
						reservationPath: window.encodeURIComponent(`HOUSING_RESERVATIONS(${sKey})`),
                        placeId: sPlaceId,
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
