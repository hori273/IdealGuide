sap.ui.define([], function() {
    "use strict";

    return {
        statusState: function(sStatus) {
            switch (sStatus) {
                case "approved":
                    console.log("a");
                    return "Success"; 
                case "pending":
                    console.log("p");
                    return "Warning"; 
                case "cancelled":
                    console.log("c");
                    return "Error"; 
                default:
                    return "Information";
            }
        },

        iconState: function(sStatus) {
            switch (sStatus) {
                case "approved":
                    return "sap-icon://sys-enter-2"; 
                case "pending":
                    return "sap-icon://alert"; 
                case "cancelled":
                    return "sap-icon://error"; 
                default:
                    return "sap-icon://information";
            }
        },

        isDeletable: function (sStatus, sDate) {
            var oDate = new Date(sDate);
            var oCurrentDate = new Date();
        
            return oDate > oCurrentDate && sStatus !== "cancelled" && sStatus !== "completed";
        },

        isFutureDate: function(sDate) {
            var oDate = new Date(sDate);
            var oNow = new Date();
            return oDate > oNow;
        },

        formatDate: function(dateTime) {
            if (dateTime) {
                const date = new Date(dateTime);
                return date.toLocaleDateString();
            }
            return dateTime;
        },

        isFeedbackAvailable: function (dateTime, status) {

            if (status !== 'completed') {
                return false;
            }
        
            const reservationDate = new Date(dateTime);
            const currentDate = new Date();
        
            if (reservationDate > currentDate) {
                return false;
            }    
            
            return true;
        }
        
    };
});
