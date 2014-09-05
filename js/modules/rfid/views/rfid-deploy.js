define([
    "underscore",
    "backbone",
    'marionette',
    'config',
    'text!templates/rfid/rfid-deploy.html'
], function(_, Backbone, Marionette, config, template) {

    "use strict";

    return Marionette.ItemView.extend({
        template: template,

        events: {
            "click #btn-action": "pose",
            "change #input-mod": "updateForm",
            "change #input-type": "updateName",
        },

        ui: {
            mod: "#input-mod",
            type: "#input-type",
            typeList: "#type-list",
            name: "#input-name",
            nameList: "#name-list",
            begin: "#input-begin",
            end: "#input-end",
            btn: "#btn-action"
        },

        initialize: function() {
            this.modules = new Backbone.Collection();
            this.sites = new Backbone.Collection();
            this.action = "";
            this.listenTo(this.modules, "reset", this.render);
            this.listenTo(this.sites, "reset", this.updateName);

            // Get the RFID modules.
            $.ajax({
                context: this,
                url: config.coreUrl + "rfid/identifier",
            }).done( function(data) {
                this.modules.reset(data);
            });
        },

        serializeData: function() {
            return {
                modules: this.modules
            }
        },

        onDestroy: function() {
            delete this.modules;
            delete this.sites;
        },

        updateName: function(e) {
            var html;
            var type = this.ui.type.val();
            if(type !== "") {
                _.each(this.sites.where({name_Type:type}), function(site) {
                    html += "<option>" + site.get("name") + "</option>";
                });
            }
            else {
                this.sites.forEach( function(site) {
                    html += "<option>" + site.get("name") + "</option>";
                });
            }
            this.ui.nameList.html(html);
        },

        disableAll: function() {
            this.ui.type.prop("disabled", true);
            this.ui.type.prop("value", null);
            this.ui.name.prop("disabled", true);
            this.ui.name.prop("value", null);
            this.ui.begin.prop("disabled", true);
            this.ui.begin.prop("value", null);
            this.ui.end.prop("disabled", true);
            this.ui.end.prop("value", null);
            this.ui.btn.prop("disabled", true);
            this.ui.btn.text("Choose a module");
            this.action = "";
        },

        enableAll: function() {
            this.ui.type.prop("disabled", false);
            this.ui.type.prop("value", null);
            this.ui.name.prop("disabled", false);
            this.ui.name.prop("value", null);
            this.ui.begin.prop("disabled", false);
            this.ui.begin.prop("value", null);
            this.ui.end.prop("disabled", false);
            this.ui.end.prop("value", null);
            this.ui.btn.prop("disabled", false);
            this.ui.btn.text("Pose");
            this.action = "pose";
            // Get the site distinct types.
            $.ajax({
                context: this,
                url: config.coreUrl + "monitoredSite/type",
            }).done( function(data) {
                var html;
                _.each(data, function(type) {
                    html += "<option>" + type + "</option>";
                });
                this.ui.typeList.html(html);
            });
            // Get the sites, show their names.
            $.ajax({
                url: config.coreUrl + "monitoredSite",
                contentType: "application/json",
                context: this,
                data: JSON.stringify({
                    "cols":["name", "name_Type"],
                    "order":["name"]
                }),
                type: "POST",
            }).done( function(data) {
                this.sites.reset(data);
            });
        },

        updateForm: function(evt) {
            var name = evt.target.value;
            $.ajax({
                context: this,
                url: config.coreUrl + "rfid/byName/" + name,
            }).done( function(data) {
                $("#group-mod").removeClass("has-error");
                $("#help-mod").text("");
                var equip = data.equip;
                var site = data.site;
                if (equip === null) {
                    this.enableAll();
                }
                else {
                    if(equip.end_date === null) {
                        this.ui.type.prop("disabled", true);
                        this.ui.type.prop("value", site.type);
                        this.ui.name.prop("disabled", true);
                        this.ui.name.prop("value", site.name);
                        this.ui.begin.prop("disabled", true);
                        this.ui.begin.prop("value", equip.begin_date);
                        this.ui.end.prop("disabled", false);
                        this.ui.end.prop("value", null);
                        this.ui.btn.prop("disabled", false);
                        this.ui.btn.text("Remove");
                        this.action = "remove";
                    }
                    else {
                        this.enableAll();
                    }
                }
            }).fail( function(data) {
                this.disableAll();
                $("#group-mod").addClass("has-error");
                $("#help-mod").text("Invalid value");
            });
        },

        pose: function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            $.ajax({
                url: config.coreUrl + "monitoredSiteEquipment/pose",
                context: this,
                type: "POST",
                data: {
                    identifier: this.ui.mod.val(),
                    type: this.ui.type.val(),
                    name: this.ui.name.val(),
                    begin: this.ui.begin.val(),
                    end: this.ui.end.val(),
                    action: this.action
                }
            }).done( function(data) {
                alert("Success : " + data);
                this.render();
            }).fail( function(data) {
                alert("Error : " + data.responseText);
                this.render();
            });
        }
    });
});
