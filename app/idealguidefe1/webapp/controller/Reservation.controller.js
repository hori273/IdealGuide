sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageToast",
    "sap/ui/unified/DateTypeRange",
    "sap/ui/unified/CalendarDayType"
], function (Controller, JSONModel, MessageToast, DateTypeRange, CalendarDayType) {
    "use strict";

    var iPrice;
    var sPlaceId;
    let sDisabledDates = [];

    var PageController = Controller.extend("idealguidefe1.controller.Reservation", {

        onInit: function (oEvent) {
            var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/supplier.json"));
            this.getView().setModel(oModel);
            this.getView().bindElement("/SupplierCollection/0");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("reservation").attachMatched(this._onRouteMatched, this);

            this.getView().setModel(new JSONModel(), "specialDatesModel");
            this.getView().attachModelContextChange(this._checkModelAndFetchDates, this);
        },

        _checkModelAndFetchDates: function () {
            const oModel = this.getView().getModel("catalog");
            if (oModel) {
                this._fetchAndApplySpecialDates(new Date().getFullYear(), new Date().getMonth() + 1);
                this.getView().detachModelContextChange(this._checkModelAndFetchDates, this);
            }
        },

        _fetchAndApplySpecialDates: async function (year, month) {
            try {
                var oModel = this.getView().getModel("catalog");
                var oContext = oModel.bindContext("/getFullyBookedDatesForHousing(...)");
                oContext.setParameter("housingId", "37DE1000-DB99-42BE-1800-91FA0E1991E0");
                oContext.setParameter("year", year);
                oContext.setParameter("month", month);

                await oContext.execute();
                const aFullyBookedDates = oContext.getBoundContext().getObject();

                this._applySpecialDates(JSON.parse(aFullyBookedDates.value));

            } catch (error) {
                console.error("Error fetching fully booked dates:", error);
            }
        },

        _applySpecialDates: function (aDates) {
            const oDatePickerCheckIn = this.byId("checkInDate");
            const oDatePickerCheckOut = this.byId("checkOutDate");

            for (let i = 0; i < aDates.length; i++) {
                const dateString = aDates[i];
                const oDate = new Date(dateString);  

                const oSpecialDate = new DateTypeRange({
                    startDate: oDate,
                    type: CalendarDayType.Disabled
                });
                
                sDisabledDates.push(oDate)
                oDatePickerCheckIn.addSpecialDate(oSpecialDate.clone());
                oDatePickerCheckOut.addSpecialDate(oSpecialDate.clone());
            }
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sHousingId = oArgs.id;
            sPlaceId = sHousingId;
            iPrice = oArgs.price;
        },

        calculateNights: function () {
            var oView = this.getView();
            var oCheckInDate = oView.byId("checkInDate").getDateValue();
            var oCheckOutDate = oView.byId("checkOutDate").getDateValue();
            var nrPersons = oView.byId("numberOfPeople").getValue();

            if (nrPersons <= 0) {
                MessageToast.show("Please insert a valid number of people");
                oView.byId("numberOfPeople").setValue(1);
                return;
            }

            var today = new Date();

            const isCheckInDisabled = sDisabledDates.some(disabledDate => 
                disabledDate.getFullYear() === oCheckInDate.getFullYear() &&
                disabledDate.getMonth() === oCheckInDate.getMonth() &&
                disabledDate.getDate() === oCheckInDate.getDate()
            );

            if (isCheckInDisabled) {
                MessageToast.show("Check-in date cannot be a fully booked date.");
                oView.byId("checkInDate").setDateValue(null);
                oCheckInDate = today;
            }

            const isCheckOutDisabled = sDisabledDates.some(disabledDate => 
                disabledDate.getFullYear() === oCheckOutDate.getFullYear() &&
                disabledDate.getMonth() === oCheckOutDate.getMonth() &&
                disabledDate.getDate() === oCheckOutDate.getDate()
            );

            if (isCheckOutDisabled) {
                MessageToast.show("Check-out date cannot be a fully booked date.");
                oView.byId("checkOutDate").setDateValue(null);
                oCheckInDate = today;
            }

            const containsDisabledDate = this._checkIfPeriodContainsDisabledDate(oCheckInDate, oCheckOutDate);
            if (containsDisabledDate) {
                MessageToast.show("Selected period contains a fully booked date.");
                oView.byId("checkOutDate").setDateValue(null);
                return;
            }

            if (oCheckInDate < today) {
                MessageToast.show("Check-in date cannot be in the past.");
                oView.byId("checkInDate").setDateValue(null);
                oCheckInDate = today;
            }

            if (oCheckInDate && oCheckOutDate) {
                if (oCheckOutDate <= oCheckInDate) {
                    MessageToast.show("Check-out date must be later than check-in date");
                    oView.byId("checkOutDate").setDateValue(null);
                    return;
                }

                var timeDiff = Math.abs(oCheckOutDate.getTime() - oCheckInDate.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                var price = iPrice * nrPersons * diffDays;

                if(!(isCheckInDisabled || isCheckOutDisabled)){
                    if (oCheckOutDate > oCheckInDate) {
                        oView.getModel().setProperty("/numberOfNights", diffDays);
                        oView.getModel().setProperty("/totalPrice", price);
                    }
                    this._updateMaxPeopleAllowed(oCheckInDate, diffDays); // Call to update max people
                }
            } else {
                oView.getModel().setProperty("/numberOfNights", 0);
            }
        },

        _updateMaxPeopleAllowed: async function (checkInDate, nights) {
            try {
                var oModel = this.getView().getModel("catalog");
                var oContext = oModel.bindContext("/getAvailableCapacityForPeriod(...)");
                
                oContext.setParameter("housingId", sPlaceId);
                oContext.setParameter("day", checkInDate.getDate());
                oContext.setParameter("month", checkInDate.getMonth() + 1);
                oContext.setParameter("year", checkInDate.getFullYear());
                oContext.setParameter("nights", nights);
                
                await oContext.execute();
                const maxPeopleAllowed = oContext.getBoundContext().getObject().value;

                console.log(maxPeopleAllowed);
        
                const oView = this.getView();
                const nrPersonsInput = oView.byId("numberOfPeople");
                const nrPersons = parseInt(nrPersonsInput.getValue(), 10);
        
                oView.getModel().setProperty("/maxPeopleAllowed", maxPeopleAllowed);
                
                if (nrPersons > maxPeopleAllowed) {
                    nrPersonsInput.setValue(maxPeopleAllowed);
                    this.getView().byId("maxPeopleText").setText(maxPeopleAllowed);
                    MessageToast.show(`Maximum allowed people: ${maxPeopleAllowed}. Adjusted number of people.`);
                    var oView2 = this.getView();
                    var oCheckInDate = oView2.byId("checkInDate").getDateValue();
                    var oCheckOutDate = oView2.byId("checkOutDate").getDateValue();
                    var nrPersons2 = oView2.byId("numberOfPeople").getValue();
                    var timeDiff = Math.abs(oCheckOutDate.getTime() - oCheckInDate.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    var price = iPrice * nrPersons2 * diffDays;
                    oView.getModel().setProperty("/totalPrice", price);

                }
            } catch (error) {
                console.error("Error fetching maximum allowed people:", error);
            }
        },        

        _checkIfPeriodContainsDisabledDate: function (checkInDate, checkOutDate) {
            const oneDay = 24 * 60 * 60 * 1000;

            for (let currentDate = new Date(checkInDate); currentDate <= checkOutDate; currentDate = new Date(currentDate.getTime() + oneDay)) {
                if (sDisabledDates.some(disabledDate => 
                    disabledDate.getFullYear() === currentDate.getFullYear() &&
                    disabledDate.getMonth() === currentDate.getMonth() &&
                    disabledDate.getDate() === currentDate.getDate()
                )) {
                    return true;
                }
            }
            return false;
        },

        async onFunctionCall() {
            var oModel = this.getView().getModel("catalog");
            var oInsertReserationHousing = oModel.bindContext("/insertReservationHousing(...)");

            var oView = this.getView();
            var nrPersons = oView.byId("numberOfPeople").getValue();
            var oCheckInDate = oView.byId("checkInDate").getDateValue();
            var nrNights = oView.byId("numberOfNights").getValue();
            var price = oView.byId("totalPrice").getValue();

            oInsertReserationHousing.setParameter("placeId", sPlaceId);
            oInsertReserationHousing.setParameter("date", oCheckInDate);
            oInsertReserationHousing.setParameter("nrPersons", nrPersons);
            oInsertReserationHousing.setParameter("nrNights", nrNights);
            oInsertReserationHousing.setParameter("price", price);
            
            try {
                await oInsertReserationHousing.execute();
                MessageToast.show("Reservation successfully submitted!");

                
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
            } catch (error) {
                MessageToast.show("Failed to submit reservation. Please try again.");
                console.error("Error submitting reservation:", error);
            }
        },

        async onApplyFidelityBonus() {
            try {
                var oModel = this.getView().getModel("catalog");
                var oFidelityBonusFunction = oModel.bindContext("/fidelityBonus(...)");
        
                var sUserEmail = 'andrei.kalman@nttdata.com';
        
                oFidelityBonusFunction.setParameter("userEmail", sUserEmail);
                oFidelityBonusFunction.setParameter("placeId", sPlaceId);
        
                await oFidelityBonusFunction.execute();
        
                var oResult = oFidelityBonusFunction.getBoundContext().getObject();
                var fFidelityBonusMultiplier = parseFloat(oResult.value);;

                var oView = this.getView();
                var iTotalPrice = oView.byId("totalPrice").getValue();

                var iTotalPriceWithBonus = Math.round(iTotalPrice * fFidelityBonusMultiplier);

                var sMessage = "Fidelity bonus multiplier: " + fFidelityBonusMultiplier + "\n" +
                       "Total price with bonus: " + iTotalPriceWithBonus;
                MessageToast.show(sMessage);
        
                oView.getModel().setProperty("/totalPrice", iTotalPriceWithBonus);
            } catch (error) {
                console.error(error);
            }
        }, 

        onNavigate: async function (oEvent) {
            const oDateRange = oEvent.getParameter("dateRange");
            if (!oDateRange) {
                console.warn("No date range provided for the navigate event.");
                return;
            }

            const oStartDate = oDateRange.getStartDate();
            const iYear = oStartDate.getFullYear();
            const iMonth = oStartDate.getMonth() + 1;

            await this._fetchAndApplySpecialDates(iYear, iMonth);

            console.log(sDisabledDates);
        },
        
    });

    return PageController;

});
