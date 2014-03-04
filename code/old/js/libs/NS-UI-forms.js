var NS = window.NS || {};

NS.UI = (function(ns) {
    "use strict";

    var cache = {
        inline: {},
        stacked: {}
    };

    var BaseView = Backbone.Layout.extend({
        manage: true, // Enable LM
        el: false, // LM will use template's root node

        initialize: function() {
            // Ensure LM will execute template() with an appriate context
            this.template = _.bind(this.template, this);
            Backbone.Layout.prototype.initialize.apply(this, arguments);
        },

        // Note: we can not rely an LM fetch/cache mechanism because we have two alternative templates for each view
        templateId: '',
        template: function(data) {
            var mode = data.inline ? 'inline' : 'stacked';
            if (!(this.templateId in cache[mode]))
                cache[mode][this.templateId] = _.template(this.constructor.templateSrc[mode], null, {variable: 'data'});
            return cache[mode][this.templateId](data);
        }
    });

    var validators = {};

	// Declare an exception class for validation errors
	var ValidationError = function(error) {
        this.message = error;
	};

    // FIXME: use cleaner OOP for validators
	validators.Number = function() {
		this.msg = 'A number is expected here';
		this.validate = function(value) {
			if (typeof value === 'number' || /^-?[0-9]+(.[0-9]*)?$/.test(value))
				return parseFloat(value);
			throw new ValidationError(this.msg);
		};
	};

	validators.Required = function() {
		this.msg = 'Blank value not allowed here';
		this.validate = function(value) {
			if (typeof value === 'undefined')
                throw new ValidationError(this.msg);
            return value;
		};
	};

    var editors = {};

    /*
     * Base class for all editors
     */
    var BaseEditor = BaseView.extend({
        validOptions: ['id', 'name', 'initialData', 'label', 'required', 'helpText', 'inline', 'validators'],

		defaults: {
            helpText: '',
            inline: false,
            required: false
        },

        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            _.defaults(options, this.defaults);
            if (!('initialData' in options) && ('defaultValue' in options))
                options.initialData = options.defaultValue;
            _.extend(this, _.pick(options, this.validOptions));
            if (!('validators' in options))
                this.validators = []; // Putting this in this.defaults seems more natural but it causes errors because the 
            if (this.required) this.validators.push(new validators.Required());
        },

        addEvents: function(events) {
            this.events = _.result(this, 'events') || {};
            _.extend(this.events, events);
            this.delegateEvents();
        },

        getValue: function() {
			// To be implemented by child classes
			// must return parsed user input
			return ;
        },

        getLabel: function() {
            return {label: this.label, required: this.required};
        },

        validate: function() {
			var value = this.getValue();
			this.clearValidationErrors();
			try {
				_.each(this.validators, function (validator) {
                    if (this.required || typeof value != 'undefined') {
                        if (typeof validator === 'string') {
                            validator = new validators[validator]();
                        }
                        value = validator.validate(value);
                    }
				}, this);
			} catch (err) {
				if (err instanceof ValidationError) {
					this.handleValidationError(err);
                    return this.trigger('valid:fail', this.name, err.message);
				}
			}
            return this.trigger('valid:pass', this.name, this.postProcessData(value));
		},

		clearValidationErrors: function () {
			// May be implemented by child classes
			this.$el.removeClass('error');
		},

		handleValidationError: function (err) {
			// May be implemented by child classes
			this.$el.addClass('error');
		},

		postProcessData: function (rawData) {
			// May be implemented by child classes
			// must return formatted data
			return rawData;
        },

        serialize: function() {
            return _.pick(this, this.validOptions);
        }
    });

    editors.Text = BaseEditor.extend({
        templateId: 'editor-text',

        events: {
            'blur input': function(e) {this.validate();}
        },

		clearValidationErrors: function () {
			BaseEditor.prototype.clearValidationErrors.apply(this, arguments);
            this.$el.find('.help-inline').html('');
		},

		handleValidationError: function (err) {
			BaseEditor.prototype.handleValidationError.apply(this, arguments);
            this.$el.find('.help-inline').html(err.message);
		},

        getValue: function() {
            if (this.$el) {
                var value = this.$el.find('[name=' + this.name + ']').val();
                return (value === '') ? undefined : value;
            }
        }
    }, {
        templateSrc: {
            stacked:
                '<div class="control-group">' +
                '    <label class="control-label" for="<%- data.id %>"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
                '    <div class="controls">' +
                '        <input type="text" id="<%- data.id %>" name="<%- data.name %>" value="<%- data.initialData %>" />' +
                '        <div class="help-inline"></div>' +
                '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                '    </div>' +
                '</div>',
            inline:
                '<td<% if (data.helpText) { %> data.title="<%- data.helpText %>"<% } %> class="control-group">' +
                '    <input type="text" id="<%- data.id %>" name="<%- data.name %>" value="<%- data.initialData %>" />' +
                '    <div class="help-inline"></div>' +
                '</td>'
        }
    });

    editors.Number = editors.Text.extend({
		initialize: function () {
            editors.Text.prototype.initialize.apply(this, arguments);
            this.validators.unshift('Number');
        }
	});

    editors.Boolean = BaseEditor.extend({
        templateId: 'editor-boolean',

		value_yes: 'yes',
		value_no: 'no',

		label_yes: 'Yes',
		label_no: 'No',

        events: {
            'blur input': function(e) {this.validate();}
        },

        initialize: function() {
			this.validOptions = this.validOptions.concat(['label_yes', 'label_no', 'value_yes', 'value_no']);
            BaseEditor.prototype.initialize.apply(this, arguments);
        },

        getValue: function() {
            if (this.$el) {
                switch(this.$el.find(':checked[name=' + this.name + ']').val()) {
                    case this.value_yes:
                        return true;
                    case this.value_no:
                        return false;
                    default: // No radio button is checked
                        return undefined;
                }
            }
        },

		clearValidationErrors: function () {
			BaseEditor.prototype.clearValidationErrors.apply(this, arguments);
            this.$el.find('.help-inline').html('');
		},

		handleValidationError: function (err) {
			BaseEditor.prototype.handleValidationError.apply(this, arguments);
            this.$el.find('.help-inline').html(err.message);
		}
    }, {
        templateSrc: {
            stacked:
                '<div class="control-group">' +
                '    <label class="control-label"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
                '    <div class="controls">' +
                '        <label class="radio inline">' +
                '            <input type="radio" id="<%- data.id %>_yes" name="<%- data.name %>" value="<%- data.value_yes %>"<% if ((typeof data.initialData === "boolean") && data.initialData) { %> checked="checked"<% } %> />' +
                '            <%- data.label_yes %>' +
                '        </label>' +
                '        <label class="radio inline">' +
                '            <input type="radio" id="<%- data.id %>_no" name="<%- data.name %>" value="<%- data.value_no %>"<% if ((typeof data.initialData === "boolean") && !data.initialData) { %> checked="checked"<% } %> />' +
                '            <%- data.label_no %>' +
                '        </label>' +
                '        <div class="help-inline"></div>' +
                '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                '    </div>' +
                '</div>',
            inline:
                '<td<% if (data.elpText) { %> title="<%- data.helpText %>"<% } %> class="control-group">' +
                '    <label class="radio inline">' +
                '        <input type="radio" id="<%- data.id %>_yes" name="<%- data.name %>" value="<%- data.value_yes %>"<% if ((typeof data.initialData === "boolean") && data.initialData) { %> checked="checked"<% } %> />' +
                '        <%- data.label_yes %>' +
                '    </label>' +
                '    <label class="radio inline">' +
                '        <input type="radio" id="<%- data.id %>_no" name="<%- data.name %>" value="<%- data.value_no %>"<% if ((typeof data.initialData === "boolean") && !data.initialData) { %> checked="checked"<% } %> />' +
                '        <%- data.label_no %>' +
                '    </label>' +
                '    <div class="help-inline"></div>' +
                '</td>'
        }
    });

    editors.CheckBox = BaseEditor.extend({
        templateId: 'editor-checkbox',

        multiple: true,

        events: {
            'blur input': function(e) {this.validate();}
        },

        initialize: function(options) {
            if (!('initialData' in options) || (typeof(options.initialData) === 'undefined')) {
                if ('defaultValue' in options) {
                    if (!_.isArray(options.defaultValue))
                        options.defaultValue = [options.defaultValue];
                    options.initialData = options.defaultValue;
                } else {
                    options.initialData = [];
                }
            // Store data in array even when select is not 'multiple'
            } else if (!_.isArray(options.initialData)) {
                options.initialData = [options.initialData];
            }
            // When the select source is a collection, initialData are model instances.
            options.initialData = _.map(options.initialData, function(d) {
                return _.isObject(d) ? d.id : d;
            });
            BaseEditor.prototype.initialize.apply(this, arguments);
            // /!\ options should not be added to validOptions because it would override this.options (which is an internal property used by LayoutManager
            this.optionConfig = options.options;
        },

        getValue: function() {
            if (this.$el) {
                var val = this.$el.find(':checked').map(function () {
                    return $(this).val();
                }).get();
                if (val.length > 0) return val;
            }
        },

        getInitialValue: function() {
            if (this.initialData.length > 0) {
                return this.initialData;
            } else {
                var optionConfig = _.result(this, 'optionConfig');
                if (!this.multiple && optionConfig.length > 0) {
                    // There is no initial data but the browser will select the first option anyway
                    if (optionConfig instanceof Backbone.Collection) {
                        return [optionConfig.at(0).id];
                    } else if ('options' in optionConfig[0]) { //optgroup
                        return [optionConfig[0].options[0].val]
                    } else {
                        return [optionConfig[0].val]
                    }
                } else {
                    return [];
                }
            }
        },

        postProcessData: function (rawData) {
            if (typeof(rawData) === 'undefined') return rawData;
            // When the select source is a collection, convert model ids into model instance.
            var optionConfig = _.result(this, 'optionConfig');
            if (optionConfig instanceof Backbone.Collection)
                rawData = _.map(rawData, function(value) {
                    return this.get(value);
                }, optionConfig);

            // Unpack data when multiple selection is not allowed
            return (this.multiple) ? rawData : rawData[0];
        },

        serialize: function() {
            var viewData = BaseEditor.prototype.serialize.apply(this, arguments);
            var options;
            var optionConfig = _.result(this, 'optionConfig');
            if (optionConfig instanceof Backbone.Collection) {
                options = optionConfig.map(function(item) {
                    return {val: item.id, label: item.toString()};
                });
            } else {
                options = _.map(optionConfig, function(item) {
					if (typeof(item) == 'object') {
                        if ('options' in item) {
                            // optgroup
                            return {
                                label: item.label,
                                options: _.map(item.options, function(subitem) {
                                    return typeof(subitem) == 'object' ? subitem : {val: subitem, label: subitem};
                                })
                            };
                        } else {
                            return item;
                        }
					} else {
						return {val: item, label: item};
					}
                });
            }
            viewData.options = options;
            return viewData;
        },

		clearValidationErrors: function () {
			BaseEditor.prototype.clearValidationErrors.apply(this, arguments);
            this.$el.find('.help-inline').html('');
		},

		handleValidationError: function (err) {
			BaseEditor.prototype.handleValidationError.apply(this, arguments);
            this.$el.find('.help-inline').html(err.message);
        }
    }, {
        templateSrc: {
            stacked:
                '<div class="control-group">' +
                '    <label class="control-label"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
                '    <div class="controls">' +
                '        <% _.each(data.options, function(item) {if (\'val\' in item) { %>' +
                '            <label class="checkbox inline"><input type="checkbox" name="<%- data.name %>" value="<%- item.val %>"<% if (_.contains(data.initialData, item.val)) { %> checked<% } %>> <%- item.label %></label>' +
                '        <% }}); %>' +
                '        <% _.each(data.options, function(item) {if (\'options\' in item) { %>' +
                '            <label class="label"><%- item.label %></label>' +
                '            <% _.each(item.options, function(subitem) { %>' +
                '                <label class="checkbox inline"><input type="checkbox" name="<%- data.name %>" value="<%- subitem.val %>"<% if (_.contains(data.initialData, subitem.val)) { %> checked<% } %>> <%- subitem.label %></label>' +
                '            <% }); %>' +
                '        <% }}); %>' +
                '        <div class="help-inline"></div>' +
                '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                '    </div>' +
                '</div>',
            inline:
                '<td<% if (data.helpText) { %> title="<%- data.helpText %>"<% } %> class="control-group">' +
                '    <% _.each(data.options, function(item) {if (\'val\' in item) { %>' +
                '        <label class="checkbox inline"><input type="checkbox" name="<%- data.name %>" value="<%- item.val %>"<% if (_.contains(data.initialData, item.val)) { %> checked<% } %>> <%- item.label %></label>' +
                '    <% }}); %>' +
                '    <% _.each(data.options, function(item) {if (\'options\' in item) { %>' +
                '        <label class="label"><%- item.label %></label>' +
                '        <% _.each(item.options, function(subitem) { %>' +
                '            <label class="checkbox inline"><input type="checkbox" name="<%- data.name %>" value="<%- subitem.val %>"<% if (_.contains(data.initialData, subitem.val)) { %> checked<% } %>> <%- subitem.label %></label>' +
                '        <% }); %>' +
                '    <% }}); %>' +
                '    <div class="help-inline"></div>' +
                '</td>'
        }
    });

	editors.Select = editors.CheckBox.extend({
        templateId: 'editor-select',

        multiple: false,

        nullValue: '',

        events: {
            'blur select': function(e) {this.validate();}
        },

        initialize: function(options) {
			this.validOptions = this.validOptions.concat(['multiple', 'nullValue']);
            editors.CheckBox.prototype.initialize.apply(this, arguments);
        },

        getValue: function() {
            if (this.$el) {
                var val = this.$el.find('select').val();
                if (val === this.nullValue || val === null) return undefined;
                if (! this.multiple) return [val];
                return val;
            }
        },

        serialize: function() {
            var viewData = editors.CheckBox.prototype.serialize.apply(this, arguments);
            if (!this.multiple) viewData.options.unshift({val: this.nullValue, label: '--'});
            return viewData;
        },
    }, {
        templateSrc: {
            stacked:
                '<div class="control-group">' +
                '    <label class="control-label"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
                '    <div class="controls">' +
                '        <select id="<%- data.id %>" name="<%- data.name %>" <% if (data.multiple) { %> multiple="multiple"<% } %>>' +
                '            <% _.each(data.options, function(item) {' +
                '                if (\'options\' in item) {' +
                '                    %><optgroup label="<%- item.label %>"><%' +
                '                    _.each(item.options, function(subitem) {' +
                '                        %><option value="<%- subitem.val %>"<% if (_.contains(data.initialData, subitem.val)) { %> selected="selected"<% } %>><%- subitem.label %></option><%' +
                '                    });' +
                '                    %></optgroup><%' +
                '                } else {' +
                '                    %><option value="<%- item.val %>"<% if (_.contains(data.initialData, item.val)) { %> selected="selected"<% } %>><%- item.label %></option><%' +
                '                }' +
                '            }); %>' +
                '        </select>' +
                '        <div class="help-inline"></div>' +
                '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                '    </div>' +
                '</div>',
            inline:
                '<td<% if (data.helpText) { %> title="<%- data.helpText %>"<% } %> class="control-group">' +
                '    <select id="<%- data.id %>" name="<%- data.name %>" <% if (data.multiple) { %> multiple="multiple"<% } %>>' +
                '        <% _.each(data.options, function(item) {' +
                '            if (\'options\' in item) {' +
                '                %><optgroup label="<%- item.label %>"><%' +
                '                _.each(item.options, function(subitem) {' +
                '                    %><option value="<%- subitem.val %>"<% if (_.contains(data.initialData, subitem.val)) { %> selected="selected"<% } %>><%- subitem.label %></option><%' +
                '                });' +
                '                %></optgroup><%' +
                '            } else {' +
                '                %><option value="<%- item.val %>"<% if (_.contains(data.initialData, item.val)) { %> selected="selected"<% } %>><%- item.label %></option><%' +
                '            }' +
                '        }); %>' +
                '    </select>' +
                '    <div class="help-inline"></div>' +
                '</td>'
        }
    });

	editors.Date = BaseEditor.extend({
        templateId: 'editor-date',

        format: 'dd/mm/yyyy',

        events: {
            'blur input': function(e) {this.validate();},
            'click span.add-on': function(e) {this.$dp.datepicker('show');}
        },

        initialize: function() {
			this.validOptions = this.validOptions.concat(['format']);
            BaseEditor.prototype.initialize.apply(this, arguments);
            this._val = this.initialData;
            this.on('afterRender', function(view) {
                view.$dp = view.$el.find('input');
                view.$dp.datepicker({format: view.format})
                        .on('changeDate', _.bind(function(ev) {
                            this._val = ev.date;
                            if (ev.viewMode == 'days') {
                                this.$dp.datepicker('hide');
                                this.$dp.trigger('blur');
                            }
                        }, view));
                if (view.initialData)
                    view.$dp.datepicker('setValue', view.initialData)
            });
        },

        getValue: function() {
            return this._val;
        }
    }, {
        templateSrc: {
            stacked:
                '<div class="control-group">' +
                '    <label class="control-label" for="<%- data.id %>"><% if (data.required) { %><b>*</b><% } %> <%- data.label %></label>' +
                '    <div class="controls">' +
                '        <div class="input-append date">' +
                '            <input type="text" id="<%- data.id %>" name="<%- data.name %>" />' +
                '            <span class="add-on"><i class="icon-calendar"></i></span>' +
                '        </div>' +
                '        <div class="help-inline"></div>' +
                '        <div class="help-block"><% if (data.helpText) { %><%- data.helpText %><% } %></div>' +
                '    </div>' +
                '</div>',
            inline:
                '<td<% if (data.helpText) { %> data.title="<%- data.helpText %>"<% } %> class="control-group">' +
                '    <div class="input-append date">' +
                '        <input type="text" id="<%- data.id %>" name="<%- data.name %>" />' +
                '        <span class="add-on"><i class="icon-calendar"></i></span>' +
                '    </div>' +
                '    <div class="help-inline"></div>' +
                '</td>'
        }
    });

	editors._Composite = BaseEditor.extend({
        // Selector for field area (an element in the template where items will be placed)
        fieldRegion: '',

        initialize: function(options) {
			this.validOptions = this.validOptions.concat(['fieldRegion']);
            BaseEditor.prototype.initialize.apply(this, arguments);

			this.childNamePrefix = (!this.childNamePrefix && this.name) ? this.name + '_' : '';
            this.data = {};
            this.errors = {};
            this.names = {};

			_.each(this.getFields(), function(fieldDefinition) {
				this.addEditor.apply(this, _.values(fieldDefinition));
			}, this);
		},

		getFields: function () {
			// To be implemented by child classes
			// must return a list of field definition: [{name: '', editor: Editor, options: {}}]
			return [];
		},

		addEditor: function (name, Editor, options) {
			// Do not proceed for readonly fields
			if (('editable' in options) && !(_.isFunction(options.editable) ? options.editable.call(this.initialData) : options.editable)) return;
			if ((Editor == editors.Select || Editor == editors.CheckBox) && _.isFunction(options.options)) {
				options.options = _.bind(options.options, this.initialData);
			}
			// Instantiate a subview for this editor + make names/identifiers unique
			var view = new Editor(_.extend({}, options, {
				id: this.id + '_' + name,
				name: this.childNamePrefix + name,
				label: options.title || name
			}));
			this.insertView(this.fieldRegion, view);
			// Keep original name in a hash
			this.names[view.name] = name;
            // Bind MultiSchema fields to their selector
            if (Editor == editors.MultiSchema) {
                var selector = this.getViews(this.fieldRegion).find(function(v) {
                    return this.selector == v.name;
                }, view).value();
                if (selector)
                    view.setSelector(selector);
            }
            // Handle validation success and error
            this.listenTo(view, 'valid:pass', this.onFieldValidate);
            this.listenTo(view, 'valid:fail', this.onFieldError);

			return view;
		},

        onFieldValidate: function(fieldName, data) {
            if (fieldName in this.names) { // BB does not support controlling event propagation, use explicit filtering instead
                var idx = this.names[fieldName];
                this.data[idx] = data;
                // forget previous validation errors if any
                delete this.errors[fieldName];
                if ($.isEmptyObject(this.errors))
                    this.trigger('valid:pass', this.name, this.postProcessData(this.data));
            }
        },

        onFieldError: function(fieldName, error) {
            if (fieldName in this.names) { // BB does not support controlling event propagation, use explicit filtering instead
                this.errors[fieldName] = error;
                return this.trigger('valid:fail', this.name, this.errors);
            }
		},

        validate: function() {
            // Relay validation to each subfield
            this.getViews(this.fieldRegion).each(function(view) {
                if (view instanceof BaseEditor)
                    view.validate();
            });
        },

        clearValidationErrors: function () {
            BaseEditor.prototype.clearValidationErrors.apply(this, arguments);
            this.getViews(this.fieldRegion).each(function(view) {
                if (view instanceof BaseEditor)
                    view.clearValidationErrors(); // Relay to subview
            });
        }
	});

    editors.NestedModel = editors._Composite.extend({
        templateId: 'subform',

        initialize: function(options) {
			// Initialize schema+initialData depending on provided input (model instance? model class? raw schema/data)
			if (options.initialData && options.initialData instanceof Backbone.Model) {
				// /!\ Should we check whether initialData is actually a model instance ?
				this.instance = options.initialData;
				this.schema = this.instance.constructor.schema;
				options.initialData = options.initialData.attributes;
			} else if (options.model) {
				this.Model = options.model;
				options.initialData = (options.initialData) ? options.initialData : {};
				this.instance = new this.Model(options.initialData);
				this.schema = this.instance.constructor.schema;
			} else {
				this.schema = options.schema;
				options.initialData = (options.initialData) ? options.initialData : {};
			}

            // Ensure we have a model class before going further
            if (typeof this.schema === 'undefined')
				throw new Error('Could not find a schema for form');

            // Use all fields if fields are not explicitly set
			this.fields = (options.fields) ? options.fields : _.keys(this.schema);

            editors._Composite.prototype.initialize.apply(this, arguments);
        },

        getFields: function () {
            var fields = [];
            this.fieldsets = {};
            _.each(this.fields, function(field) {
                var fieldDef, name;
                if (_.isObject(field)) {
                    // Fieldset
                    name = _.uniqueId(this.name);
                    fieldDef = {
                        title: field.title,
                        type: 'NestedModel',
                        initialData: this.instance || this.initialData,
                        fields: field.fields
                    };
                    this.fieldsets[name] = true;
                } else {
                    // Regular fields
                    name = field;
                    fieldDef = _.clone(this.schema[name]);
                    if (name in this.initialData)
                        fieldDef.initialData = this.initialData[name];
                }
                fieldDef.inline = fieldDef.inline || this.inline;

                var editor = editors[fieldDef.type];
                if (editor)
                    fields.push({name: name, editor: editor, options: fieldDef});
            }, this);
            return fields;
        },

        getLabel: function() {
            var labels = [];
            this.getViews(this.fieldRegion).each(function(view) {
                if (view instanceof BaseEditor) {
                    labels.push(view.getLabel());
                }
            });
            return labels;
        },

        onFieldValidate: function(fieldName, data) {
            if (fieldName in this.names) { // BB does not support controlling event propagation, use explicit filtering instead
                var idx = this.names[fieldName];
                if (!(this.fieldsets && (idx in this.fieldsets)))
                    this.data[idx] = data;
                // forget previous validation errors if any
                delete this.errors[fieldName];
                if ($.isEmptyObject(this.errors))
                    this.trigger('valid:pass', this.name, this.postProcessData(this.data));
            }
        },

        onFieldError: function(fieldName, error) {
            if (fieldName in this.names) { // BB does not support controlling event propagation, use explicit filtering instead
                this.errors[fieldName] = error;
                return this.trigger('valid:fail', this.name, this.errors);
            }
        },

		postProcessData: function (rawData) {
			if (this.instance) {
				this.instance.set(rawData);
				return this.instance;
			} else {
				return rawData;
			}
		},

        serialize: function() {
            return {title: this.label, helpText: this.helpText, inline: this.inline};
        }
    }, {
        templateSrc: {
            stacked:
                '<fieldset>' +
                '    <legend><%- data.title %></legend>' +
                '    <div class="help-block"><% if (data.helpText) { %><span class="label label-info">Note:</span> <%- data.helpText %><% } %></div>' +
                '</fieldset>',
            inline: '<tr></tr>'
        }
    });

    editors.List = editors._Composite.extend({
        templateId: 'editor-list',
        fieldRegion: '.items',
        headRegion: 'thead',

        events: {
            'click .add-item': 'addItem'
        },

        initialize: function(options) {
            // Ensure we have a model class before going further
            if (typeof options.model === 'undefined')
				throw new Error('Could not find model class for List form');

            this.validOptions = this.validOptions.concat(['headRegion']);

			// Initialize specific options
            this.defaults = _.extend({}, this.defaults, {
                inline: true,
                initialData: []
            });
            this._counter = 0;

            this.headerView = new this.constructor.Header();
            this.insertView(this.headRegion, this.headerView);

            editors._Composite.prototype.initialize.apply(this, arguments);

            this.data = [];

            // If list is not empty, display labels as an header row
            if (this._counter > 0) {
                var anyRowView = this.getView(this.fieldRegion); // LM will return the first matching view
                this.headerView.options.headers = anyRowView.getLabel();
            }
        },

		getFields: function () {
			var fields = [];
			_.each(this.initialData, function(instance) {
				var options = this.getItemOptions();
				options.initialData = instance;

				fields.push({
					name: this._counter++,
					editor: editors.NestedModel,
					options: options
				});
			}, this);
			return fields;
        },

        getItemOptions: function() {
            return _.pick(this, 'model', 'inline');
        },

        addItem: function(e) {
			var view = this.addEditor(
							this._counter++,
							editors.NestedModel,
							this.getItemOptions());

            // If item is the first item, also display labels as an header row
            if (this._counter == 1) {
                this.headerView.options.headers = view.getLabel();
                this.headerView.render();
            }

			// Render the new editor
            var doneCallback = $.proxy(function(view) {
                // Call LM internal method to attach a rendered subview (known as "partially render the view")
                this.options.partial(this.$el, view.$el, this.__manager__, view.__manager__);
            }, this);
            view.render().done(doneCallback);
        }
    }, {
        templateSrc: {
            stacked:
                '<div>' +
                '    <div class="help-block"><% if (data.helpText) { %><span class="label label-info">Note:</span> <%- data.helpText %><% } %></div>' +
                '    <div class="items"></div>' +
                '    <button type="button" class="btn add-item">Add</button>' +
                '</div>',
            inline:
                '<div>' +
                '    <div class="help-block"><% if (data.helpText) { %><span class="label label-info">Note:</span> <%- data.helpText %><% } %></div>' +
                '    <table class="form-inline">' +
                '        <thead></thead>' +
                '        <tbody class="items"></tbody>' +
                '    </table>' +
                '    <button type="button" class="btn add-item">Add</button>' +
                '</div>'
        }
    });

    editors.List.Header = BaseView.extend({
        templateId: 'editor-listheader',

        serialize: function() {
            return ('headers' in this.options) ? _.pick(this.options, 'headers') : {headers: []};
        }
    }, {
        templateSrc: {
            stacked: '<tr><% _.each(data.headers, function(header) { %><th><% if (header.required) { %><b>*</b> <% } %><%- header.label %></th><% }); %></tr>',
            inline: ''
        }
    });

    editors.MultiSchema = editors.NestedModel.extend({
        // TODO: not compatible with fieldsets...
        initialize: function(options) {
            this.validOptions = this.validOptions.concat(['schemas', 'selector']);

            if (!('schemas' in options))
                throw new Error('Could not find schemas definition');

            if (!('selector' in options))
                throw new Error('Could not attach to a selector field');

            this.activeSchema = null;
            this.initialSchema = null;
            this.cache = {};
            options.initialData = (options.initialData) ? options.initialData : {};

            editors._Composite.prototype.initialize.apply(this, arguments);
        },

        getFields: function () {
            var fields = [];

            var schemas = _.result(this, 'schemas');
            _.each(schemas[this.activeSchema], function(field, name) {
                if (this.activeSchema in this.cache && name in this.cache[this.activeSchema].data) {
                    field.initialData = this.cache[this.activeSchema].data[name];
                } else if (this.activeSchema !== null && this.activeSchema == this.initialSchema) {
                    field.initialData = this.initialData[name];
                }
                field.inline = field.inline || this.inline;

                var editor = editors[field.type];
                if (editor)
                    fields.push({name: name, editor: editor, options: field});
            }, this);
            return fields;
        },

        setSelector: function(view) {
            this.initialSchema = view.getInitialValue()[0];
            this.setSchema(this.initialSchema);
            view.addEvents({'change select': _.bind(function(e) {this.setSchema($(e.target).val());}, this)});
        },

        setSchema: function(id) {
            var schemas = _.result(this, 'schemas');
            if (!(id in schemas)) return;

            this.activeSchema = id;

            if (!(id in this.cache))
                this.cache[id] = {data: {}, names: {}, errors: {}};

            // Blank fields from the previous schema
            this.getViews(this.fieldRegion).each(function(view) {
                if (view instanceof BaseEditor) {
                    view.remove();
                }
            }),

            // Point toword activeSchema data
            this.data = this.cache[id].data;
            this.errors = this.cache[id].errors;
            this.names = this.cache[id].names;

            // Create editors for each fields
            _.each(this.getFields(), function(fieldDefinition) {
                this.addEditor.apply(this, _.values(fieldDefinition));
            }, this);

            // Refresh view if it has already rendered
            if (this.el.parentNode) this.render();
        }
    });

    ns.Form = editors.NestedModel.extend({
		templateId: 'form',

        events: {
            'submit': 'onSubmit',
            'reset': 'onReset'
        },

        // Selector for field area
        fieldRegion: '.form-content',

        initialize: function(options) {
            // Set default configuration
            this.defaults = _.extend({}, this.defaults, {
                id: _.uniqueId('form_'),
                label: ''
            });

            // Infere configuration from the model instance if any
            if (options.initialData && options.initialData instanceof Backbone.Model) {
                var instance = options.initialData;
                this.defaults = _.extend({}, this.defaults, {
                    id: (instance.isNew()) ? this.defaults.id : 'form_' + instance.id,
                    label: (instance.isNew()) ? 'New ' + instance.constructor.verboseName.toLowerCase() : instance.constructor.verboseName + ' ' + instance.id
                });
            } else if (options.model) {
                this.defaults = _.extend({}, this.defaults, {
                    label: 'New ' + options.model.verboseName.toLowerCase()
                });
            }

            editors.NestedModel.prototype.initialize.call(this, options);
        },

        onFieldValidate: function(fieldName, data) {
            editors.NestedModel.prototype.onFieldValidate.apply(this, arguments);
            if (fieldName in this.names && $.isEmptyObject(this.errors))
                this.toggleSubmit(false);
        },

        onFieldError: function(fieldName, error) {
            editors.NestedModel.prototype.onFieldError.apply(this, arguments);
            if (fieldName in this.names)
                this.toggleSubmit(true);
        },

        toggleSubmit: function(disabled) {
            this.$el.find('input[type="submit"]').prop('disabled', disabled);
        },

        onReset: function(e) {
            this.clearValidationErrors();
            this.toggleSubmit(false);
            this.data = {};
        },

        onSubmit: function(e) {
            e.preventDefault();

            // /!\ We rely on .trigger() being synchronous here. It feels weak.
            this.validate();

            if ($.isEmptyObject(this.errors)) {
                this.trigger('submit:valid', this.postProcessData(this.data));
            } else {
                this.trigger('submit:invalid', this.errors);
            }
        }
    }, {
        templateSrc: {
            stacked:
                '<form class="<% if (data.inline) { %>form-inline<% } else { %>form-horizontal<% } %>">' +
                '    <h3><%- data.title %></h3>' +
                '    <div class="form-content"></div>' +
                '    <div class="form-actions">' +
                '       <input type="submit" class="btn btn-primary" /> <input type="reset" class="btn" />' +
                '    </div>' +
                '</form>',
            inline: ''
        },
        editors: editors  // Keep a reference to editor classes in order to allow templateSrc customization
    });

    // Expose validation related objects, so that user can extend it
    ns.Form.ValidationError = ValidationError;
    ns.Form.validators = validators;

    return ns;
})(NS.UI || {});