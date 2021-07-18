// @ts-nocheck
sap.ui.define([
    // "sap/ui/core/mvc/Controller",
    "logaligroup/Employees/controller/Base.controller",
    "logaligroup/Employees/model/formatter",
    "sap/m/MessageBox"

], function (Base, formatter, MessageBox) {

    function onInit() {
        this._bus = sap.ui.getCore().getEventBus();
    };

    function onCreateIncidence() {
        var tableIncidence = this.getView().byId("tableIncidence");
        var newIncidence = sap.ui.xmlfragment("logaligroup.Employees.fragment.NewIncidence", this);
        var incidenceModel = this.getView().getModel("incidenceModel");
        var odata = incidenceModel.getData();
        var index = odata.length;
        odata.push({ index: index + 1, _ValidateDate: false, EnabledSave: false });
        incidenceModel.refresh();
        newIncidence.bindElement("incidenceModel>/" + index);
        tableIncidence.addContent(newIncidence);
    };

    function onDeleteIncidence(oEvent) {

        /*      var tableIncidence = this.getView().byId("tableIncidence");
                var rowIncidence = oEvent.getSource().getParent().getParent();
                var incidenceModel = this.getView().getModel("incidenceModel");
                var odata = incidenceModel.getData();
                var contextObj = rowIncidence.getBindingContext("incidenceModel").getObject();
                odata.splice(contextObj.index - 1, 1);
                for (var i in odata) {
                    odata[i].index = parseInt(i) + 1;
                };
                incidenceModel.refresh();
                tableIncidence.removeContent(rowIncidence);
        
                for (var j in tableIncidence.getContent()) {
                    tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j);
                } */

        var contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();

        MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {
            onClose: function (oAction) {
                if (oAction === "OK") {
                    this._bus.publish("incidence", "onDeleteIncidence", {
                        IncidenceId: contextObj.IncidenceId,
                        SapId: contextObj.SapId,
                        EmployeeId: contextObj.EmployeeId,
                    });
                }

            }.bind(this)
        });
    };

    function onSaveIncidence(oEvent) {

        var incidence = oEvent.getSource().getParent().getParent();
        var incidenceRow = incidence.getBindingContext("incidenceModel")
        this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });
    };

    function updateIncidenceCreationDate(oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObj = context.getObject();
        let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        if (!oEvent.getSource().isValidValue()) {
            contextObj._ValidateDate = false;
            contextObj.CreationDateState = "Error";
            MessageBox.error(oResourceBundle.getText("errorCreateionDateValue"), {
                title: "Error",
                onClose: null,
                styleClass: "",
                actions: MessageBox.Action.Close,
                emphasizeAction: null,
                initialFocus: null,
                textDirection: sap.ui.core.TextDirection.Inherit
            })
        } else {
            contextObj.CreationDateX = true;
            contextObj._ValidateDate = true;
            contextObj.CreationDateState = "None";
        };

        if (oEvent.getSource().isValidValue() && contextObj.Reason) {
            contextObj.EnabledSave = true;
        } else {
            contextObj.EnabledSave = false;
        };

        context.getModel().refresh();
    };

    function updateIncidenceReason(oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObj = context.getObject();

        if (oEvent.getSource().getValue()) {
            contextObj.ReasonX = true;
            contextObj.ReasonState = "None"
        } else {
            contextObj.ReasonState = "Error"
        };

        if (contextObj._ValidateDate && oEvent.getSource().getValue()) {
            contextObj.EnabledSave = true;
        } else {
            contextObj.EnabledSave = false;
        };

        context.getModel().refresh();
    };

    function updateIncidenceType(oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObj = context.getObject();

        if (contextObj._ValidateDate && contextObj.Reason) {
            contextObj.EnabledSave = true;
        } else {
            contextObj.EnabledSave = false;
        };
        contextObj.TypeX = true;
        context.getModel().refresh();
    };

    // function toOrderDetails(oEvent) {
    //     var orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
    //     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    //     oRouter.navTo("RouteOrderDetails", {
    //         OrderID : orderID
    //     });
    // };


    var EmployeeDetails = Base.extend("logaligroup.Employees.controller.EmployeeDetails", {});

    EmployeeDetails.prototype.onInit = onInit;
    EmployeeDetails.prototype.onCreateIncidence = onCreateIncidence;
    EmployeeDetails.prototype.onDeleteIncidence = onDeleteIncidence;
    EmployeeDetails.prototype.onSaveIncidence = onSaveIncidence;
    EmployeeDetails.prototype.Formatter = formatter;
    EmployeeDetails.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
    EmployeeDetails.prototype.updateIncidenceReason = updateIncidenceReason;
    EmployeeDetails.prototype.updateIncidenceType = updateIncidenceType;
    // EmployeeDetails.prototype.toOrderDetails = toOrderDetails;

    return EmployeeDetails;
});