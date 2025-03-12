sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "seeyourhousingreservations/model/formatter"
],
function (Controller, JSONModel, Filter, FilterOperator, MessageBox, formatter) {
    "use strict";

    return Controller.extend("seeyourhousingreservations.controller.SeeYourHousingReservations", {
        formatter: formatter,

        async onInit() {
            const oViewModel = new JSONModel({
                currency: "EUR"
            });
            this.getView().setModel(oViewModel, "view");

            this.loadReservationsModel();
        },

        async loadReservationsModel() {
            const oModel = this.getOwnerComponent().getModel("catalog");
            const oGetReservations = oModel.bindContext("/getReservationsByHotelEmail(...)");

            oGetReservations.setParameter("email", 'andrei.kalman@nttdata.com');

            await oGetReservations.execute();

            const oResult = oGetReservations.getBoundContext().getObject();

            console.log(oResult.value);

            const oReservationsModel = new JSONModel();
            oReservationsModel.setProperty("/HOUSING_RESERVATIONS", JSON.parse(oResult.value))

            this.getView().setModel(oReservationsModel, "reservations");
            this.getView().byId("reservationList").setModel(this.getView().getModel("reservations"));

            console.log(oResult.value);
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

        onApproveReservation(oEvent) {
            const oButton = oEvent.getSource();
            const sPlaceId = oButton.getCustomData().find(data => data.getKey() === "reservationId").getValue();

            MessageBox.confirm(`Are you sure you want to approve the reservation with ID: ${sPlaceId}?`, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: async (oAction) => {
                    if (oAction === MessageBox.Action.YES) {
                        await this._approveReservation(sPlaceId);
                    }
                }
            });
        },

        async _approveReservation(sPlaceId) {
            const oModel = this.getOwnerComponent().getModel("catalog");

            try {
                const oContext = oModel.bindContext("/approveReservationHousing(...)");
                oContext.setParameter("placeId", sPlaceId);

                await oContext.execute();

                MessageBox.success(`Reservation for place ID: ${sPlaceId} has been successfully approved.`);
                
                // Reload reservations model to reflect changes
                await this.loadReservationsModel();
            } catch (error) {
                MessageBox.error(`Failed to approve reservation: ${error.message}`);
                console.error("Error approve reservation:", error);
            }
        }
    });
});
