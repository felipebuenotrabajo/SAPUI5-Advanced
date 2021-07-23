// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"

], function (Controller, MessageBox) {
    'use strict';

    return Controller.extend("logaligroup.Employees.controller.Main", {

        onBeforeRendering: function () {
            this._detailEmployeeView = this.getView().byId("detailEmployeeView");
        },

        onInit: function () {
            var oView = this.getView();
            //var i18nBundle = oView.getModel("i18n").getResourceBundle();
            // @ts-ignore
            var oJSONModelEmpl = new sap.ui.model.json.JSONModel();
            // oJSONModelEmpl.loadData("./localService/mockdata/Employees.json", false);
             oJSONModelEmpl.loadData("./model/json/Employees.json", false);            
            oView.setModel(oJSONModelEmpl, "jsonEmployees");

            var oJSONModelCountries = new sap.ui.model.json.JSONModel();
            //oJSONModelCountries.loadData("./localService/mockdata/Countries.json", false);
             oJSONModelCountries.loadData("./model/json/Countries.json", false);
            oView.setModel(oJSONModelCountries, "jsonCountries");

            var oJSONModelLayout = new sap.ui.model.json.JSONModel();
            // oJSONModelLayout.loadData("./localService/mockdata/Layout.json", false);
             oJSONModelLayout.loadData("./model/json/Layout.json", false);
            oView.setModel(oJSONModelLayout, "jsonLayout");

            var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                visibleID: true,
                visibleName: true,
                visibleCountry: true,
                visibleCity: false,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false
            });
            oView.setModel(oJSONModelConfig, "jsonModelConfig");

            this._bus = sap.ui.getCore().getEventBus();
            this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);
            this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveODataIncidence, this);

// En este caso vamos a crear la función DENTRO del evento            
            this._bus.subscribe("incidence", "onDeleteIncidence", function(channelId, eventId, data){
                
                var oResourceModel = this.getView().getModel("i18n").getResourceBundle();

                this.getView().getModel("incidenceModel").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId +
                    "',SapId='" + data.SapId +
                    "',EmployeeId='" + data.EmployeeId + "')", {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(data.EmployeeId);
                        sap.m.MessageToast.show(oResourceModel.getText("oDataDeleteOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceModel.getText("oDataDeleteKO"));
                    }.bind(this),
                });

            }, this);
        },

        showEmployeeDetails: function (category, nameEvent, path) {
            var detailView = this.getView().byId("detailEmployeeView");
            detailView.bindElement("odataNorthwind>" + path);
            this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

            var incidenceModel = new sap.ui.model.json.JSONModel([]);
            detailView.setModel(incidenceModel, "incidenceModel");
            detailView.byId("tableIncidence").removeAllContent();

            this.onReadODataIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID);

        },

        onSaveODataIncidence: function (channelId, eventId, data) {
            var oResourceModel = this.getView().getModel("i18n").getResourceBundle();
            var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
            var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

            if (typeof incidenceModel[data.incidenceRow].IncidenceId === 'undefined') {
                var body = {
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: employeeId.toString(),
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    Type: incidenceModel[data.incidenceRow].Type,
                    Reason: incidenceModel[data.incidenceRow].Reason

                };
                this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(employeeId);
                        //sap.m.MessageToast.show(oResourceModel.getText("odataSaveOK"));
                        MessageBox.success(oResourceModel.getText("odataSaveOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceModel.getText("odataSaveKO"));
                    }.bind(this)

                })
            } else if (incidenceModel[data.incidenceRow].CreationDateX ||
                incidenceModel[data.incidenceRow].ReasonX ||
                incidenceModel[data.incidenceRow].TypeX) {
                var body = {
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    CreationDateX: incidenceModel[data.incidenceRow].CreationDateX,
                    Type: incidenceModel[data.incidenceRow].Type,
                    TypeX: incidenceModel[data.incidenceRow].TypeX,
                    Reason: incidenceModel[data.incidenceRow].Reason,
                    ReasonX: incidenceModel[data.incidenceRow].ReasonX,
                };
                this.getView().getModel("incidenceModel").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId +
                                                                 "',SapId='" + incidenceModel[data.incidenceRow].SapId + 
                                                                 "',EmployeeId='" + incidenceModel[data.incidenceRow].EmployeeId + "')", body, {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(employeeId);
                        sap.m.MessageToast.show(oResourceModel.getText("oDataUpdateOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceModel.getText("oDataUpdateKO"));
                    }.bind(this),
                });
            }

            else {
                sap.m.MessageToast.show(oResourceModel.getText("odataSavenoChanges"));
            };

        },

        onReadODataIncidence: function (EmployeeID) {

            this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                filters: [
                    new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                    new sap.ui.model.Filter("EmployeeId", "EQ", EmployeeID.toString())
                ],
                success: function (data) {
                    var incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                    incidenceModel.setData(data.results);
                    var tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                    tableIncidence.removeAllContent();

                    for (var incidence in data.results) {

                        data.results[incidence]._ValidateDate = true;
                        data.results[incidence].EnabledSave = false;

                        var newIncidence = sap.ui.xmlfragment("logaligroup.Employees.fragment.NewIncidence", this._detailEmployeeView.getController());
                        this._detailEmployeeView.addDependent(newIncidence);
                        newIncidence.bindElement("incidenceModel>/" + incidence);
                        tableIncidence.addContent(newIncidence);
                    }
                }.bind(this),
                error: function (e) {

                }
            });
        }

    });
});