sap.ui.define([], function () {
    "use strict";

    return {
        isApproveEnabled: function (sStatus, sDate) {
            var oDate = new Date(sDate);
            var oCurrentDate = new Date();

            return sStatus === "pending" && oDate > oCurrentDate;
        },

        isCancelEnabled: function (sStatus, sDate) {
            var oDate = new Date(sDate);
            var oCurrentDate = new Date();

            return (sStatus === "approved" || sStatus === "pending") && oDate > oCurrentDate;
        },

        formatDate: function(dateTime) {
            if (dateTime) {
                const date = new Date(dateTime);
                return date.toLocaleDateString();
            }
            return dateTime;
        },

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
        }
    };
});
