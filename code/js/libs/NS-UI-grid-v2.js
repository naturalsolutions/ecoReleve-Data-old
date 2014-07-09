/*
 * Grid view
 */

var NS = window.NS || {};

NS.UI = (function(ns) {
    "use strict";

    var tplCache = {},
        BaseView,
        DateFormater = function() {
            var lang = (["fr", "en"].indexOf( (navigator.language || navigator.userLanguage) ) > -1) ? (navigator.language || navigator.userLanguage) : "en";
            var month = {
                "en" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                "fr" : ["Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec"]
            };
             var days = {
                "en" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                "fr" : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
            };
            var zeroPad = function(number) {
                return ("0" + number).substr(-2, 2);
            };
            var dateFunction = function(date, item) {
                switch (item) {
                    case "dd"   : return zeroPad(date.getDate()); break;
                    case "d"    : return date.getDate(); break;
                    case "mm"   : return zeroPad(date.getMonth() + 1); break;
                    case "m"    : return (date.getMonth() + 1); break;
                    case "yyyy" : return date.getFullYear(); break;
                    case "yy"   : return date.getFullYear().toString().substr(2, 2); break;
                };
            };
            /**
             * Return the date in string format, ex : 2014-01-23T00:00:00.000Z to 23/01/2014 with dd/mm/yyyy format
             * @param   {Dare}      date            date object
             * @param   {string}    formatString    format for conversion
             * @returns {string}    date formatted in string
             */
            this.format = function(date, formatString) {
                var res = "";

                _.each( formatString.split('/'), function(item) {
                    res += dateFunction(date, item) + '/';
                });

                return res.substr(0, res.length - 1);
            };
            /**
             * Return an object date from date in string and format, ex : 23/01/2014 with dd/mm/yyyy 2014-01-23T00:00:00.000Z
             * @param   {string} strDate    the date in string
             * @param   {string} strFormat  the date format
             * @returns {Date}   date in object
             */
            this.getDate = function(strDate, strFormat) {

                var dateArray   = {};
                var dateSplit   = strDate.split('/');
                var formatSplit = strFormat.split("/");

                _.each(dateSplit, function(value, key) {
                    dateArray[ formatSplit[key] ] = dateSplit[key];
                });

                var d = new Date(), month, day, year;

                //  setDate
                if ("dd" in dateArray) {
                    day = parseInt(dateArray['dd']);
                } else if ("d" in dateArray) {
                    day = parseInt(dateArray['d']);
                }
                //  setMonth
                if ("mm" in dateArray) {
                    month = parseInt(dateArray['mm']);
                } else if ("m" in dateArray) {
                    month = parseInt(dateArray['m']);
                }
                //  setYear
                if ("yyyy" in dateArray) {
                    year = parseInt(dateArray['yyyy']);
                } else if ("yy" in dateArray) {
                    year = parseInt(dateArray['yy']);
                }
                d = new Date(year, month - 1, day)
                if (d.getFullYear() < 2000) {
                    d.setFullYear(year + 2000);
                }
                d.setHours(1, 0, 0, 0);
                return d;
            };
        };

    /*
     * Utility class holding rendering process and sub-view management.
     * It may looks like LayoutManager because this grid component used to depend on it.
     */
    BaseView = Backbone.View.extend({
        initialize: function() {
            this._views = {};
        },
        /*
         * Template management
         */

        // Child classes must declare a template and store the template string in NS.UI.GridTemplates[template]
        template: '',
        fetchTemplate: function(name) {
            if (!(this.template in tplCache))
                tplCache[this.template] = _.template(ns.GridTemplates[this.template], null, {variable: 'data'});
            return tplCache[this.template];
        },
        /*
         * Sub-view management
         */

        getViews: function(selector) {
            if (selector in this._views)
                return this._views[selector];
            return [];
        },
        insertView: function(selector, view) {
            // Keep a reference to this selector/view pair
            if (!(selector in this._views))
                this._views[selector] = [];
            this._views[selector].push(view);
            // Forget this subview when it gets removed
            view.once('remove', function(view) {
                var i, found = false;
                for (i = 0; i < this.length; i++) {
                    if (this[i].cid == view.cid) {
                        found = true;
                        break;
                    }
                }
                if (found)
                    this.splice(i, 1);
            }, this._views[selector]);
        },
        removeViews: function(selector) {
            if (selector in this._views)
                while (this._views[selector].length) {
                    this._views[selector][0].remove();
                }
        },
        // Take care of sub-views before removing
        remove: function() {
            _.each(this._views, function(viewList, selector) {
                _.each(viewList, function(view) {
                    view.remove();
                });
            });
            this.trigger('remove', this);
            Backbone.View.prototype.remove.apply(this, arguments);
        },
        /*
         * Rendering process
         */

        // To be implemented by child classes
        serialize: function() {
            return {};
        },
        // Can be overridden by child classes
        beforeRender: function() {
        },
        afterRender: function() {
        },
        render: function() {
            // Give a chance to child classes to do something before render
            this.beforeRender();

            var tpl = this.fetchTemplate(),
                    data = this.serialize(),
                    rawHtml = tpl(data),
                    rendered;

            // Re-use nice "noel" trick from LayoutManager
            rendered = this.$el.html(rawHtml).children();
            this.$el.replaceWith(rendered);
            this.setElement(rendered);

            // Add sub-views
            var base;
            _.each(this._views, function(viewList, selector) {
                base = (selector) ? this.$el.find(selector) : this.$el;
                _.each(viewList, function(view) {
                    view.render().$el.appendTo(this);
                }, base);
            }, this);
            base = null; // Allow GC

            // Give a chance to child classes to do something after render
            this.afterRender();

            return this;
        }
    });

    var GridRow = BaseView.extend({
        template: 'row',
        events: {
            'click': 'onClick'
        },
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.render);

            this.formater = new DateFormater();    //  create date formater
            this.dateFormat = options.format;      //  get date format from options
        },
        _getFlatAttrs: function(prefix, values, schema, attrs) {

            _.each(schema, function(field, fieldName) {

                if (('main' in field) && !field.main)
                    return;
                switch (field.type) {
                    case 'MultiSchema':
                        var schemas = _.result(schema[fieldName], 'schemas');
                        this._getFlatAttrs(
                                prefix + fieldName + '.',
                                values,
                                schemas[attrs[schema[fieldName].selector].id],
                                attrs[fieldName] || {}
                        );
                        break;
                    case 'NestedModel':
                        this._getFlatAttrs(
                                prefix + fieldName + '.',
                                values,
                                schema[fieldName].model.schema,
                                attrs[fieldName].attributes
                                );
                        break;
                    case 'List':
                        if (Object.keys(attrs[fieldName]).length === 0) {
                            var array = [];
                            _.each(schema[fieldName].model.schema, function(v) {
                                if ("main" in v) {
                                    if (v['main']) {
                                        array.push({});
                                    }
                                } else {
                                    array.push({});
                                }
                            });
                            values[fieldName] = array;
                        } else {
                            values[fieldName] = [];
                            _.each(attrs[fieldName], function(model, idx) {
                                var tmp = {};
                                this._getFlatAttrs(
                                        prefix + fieldName + '.' + idx + '.',
                                        tmp,
                                        schema[fieldName].model.schema,
                                        attrs[fieldName][idx].attributes
                                        );
                                values[fieldName][idx] = tmp;
                            }, this);
                        }
                        break;
                    case 'Date':
                        var d = attrs[fieldName];

                        if (d !== undefined && _.isDate(new Date(d))) {
                            d = this.formater.format(new Date(d), this.dateFormat);
                        }
                        values[prefix + fieldName] = d;
                        break;
                    default:
                        values[prefix + fieldName] = attrs[fieldName];
                        break;
                }
            }, this);
        },
        getFlatAttrs: function(model) {
            if (!model.constructor.schema) {
                return model.attributes;
            }
            var values = {};

            this._getFlatAttrs('', values, model.constructor.schema, model.attributes);

            return values;
        },
        serialize: function() {
            var viewData = {};
            viewData.attr = this.getFlatAttrs(this.model);
            viewData.maxRowSpan = 1;
            _.each(viewData.attr, function(element) {
                if (_.isArray(element)) {
                    var len = element.length;
                    viewData.maxRowSpan = (len > viewData.maxRowSpan) ? len : viewData.maxRowSpan;
                }
            });
            return viewData;
        },
        onClick: function(e) {
            e.preventDefault(); // FIXME: What if the grid row holds button or anchors? or the user want to add click handler on some part of the row?
            this.trigger('selected', this.model);
        }
    });

    ns.Grid = BaseView.extend({
        template: 'grid',
        events: {
            'click .pagination [data-target]': 'onPage',
            'click .sort-action': 'onSort',
            'click .filter-action': 'toggleFilter',
            'click .clear-filters button': 'clearAllFilters',
            'submit .filter-form form': 'addFilter',
            'input .filter-form input[type="number"]': 'onNumberInput',
            'reset .filter-form form': 'clearFilter',
            'change .pagination select[name="pagesizes"]': 'onPageRedim',
            'click .dateSection input[name="choose"]' : "onDateFilter",
            'click input[type="radio"]' : "selectBtn"
        },
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            // Config
            options = options || {};
            _.defaults(options, {
                currentSchemaId: '',
                dateFormat: 'dd/mm/yyyy',
                filters: {},
                disableFilters: false,
                size: 0,
                pagerPosition: 'both',
                pageSizes: [10, 15, 25, 50],
                pageSize: 10,
                page: 1,
                maxIndexButtons: 7
            });
            _.extend(this, _.pick(options, ['sortColumn', 'sortOrder', 'currentSchemaId', 'filters', 'disableFilters', 'size', 'pageSizes', 'pageSize', 'page', 'maxIndexButtons', 'pagerPosition', 'dateFormat']));
            if (options.collection)
                this.setCollection(options.collection);

            this._numberRegexp = new RegExp('^([0-9]+|[0-9]*[\.,][0-9]+)$');
        },
        selectBtn : function(e) {
            var element = e.target;
            var elementName =  $(element).attr("name");
            var ele = "input[name='" + elementName + "']";
            $(ele).attr('checked',false);
            $(element).attr('checked',true);


        },
        setCollection: function(c) {
            if (this.collection)
                this.stopListening(this.collection);
            this.collection = c;
            this.listenTo(c, 'reset', this.render);
            this.listenTo(c, 'all', this.render);
        },
        _getSubHeaders: function(schema, prefix) {
            var context = {
                grid: this,
                prefix: prefix,
                subDepth: 0
            }, sub = {
                headers: []
            };
            var format = this.dateFormat; // allow to know the date format in the each 
            
            _.each(schema, function(field, id) {
                
                if (('main' in field) && !field.main)
                    return;
                var header = {
                    id: this.prefix + id,
                    title: field.title || id,
                    sortable: 'sortable' in field && field.sortable,
                    order: (this.prefix + id == this.grid.sortColumn) ? this.grid.sortOrder || 'asc' : '',
                    sub: {depth: 0, headers: []}
                };
                
                switch (field.type) {
                    case 'NestedModel':
                    case 'List':
                        header.sub = this.grid._getSubHeaders(field.model.schema, this.prefix + id + '.');
                        break;
                    case 'MultiSchema':
                        var schemas = _.result(field, 'schemas');
                        var selected = this.grid.currentSchemaId;
                        if (selected !== '') {
                            header.sub = this.grid._getSubHeaders(schemas[selected], this.prefix + id + '.');
                        }
                        break;
                    case 'Text':
                    case 'Boolean':
                    case 'Number':
                        if (!this.grid.disableFilters) {
                            var obj = this.grid.filters[this.prefix + id];
                            if (obj == undefined) {
                                header.filter = {type: field.type, val: undefined, selectedOption: undefined};
                            } else {
                                var value, opt;
                                if (obj.indexOf(":") > 1) {
                                    var split = obj.split(":"), opt = split[0];
                                    split.shift()
                                    value = split.join("");
                                } else {
                                    value = obj;
                                    opt = undefined;
                                }
                                header.filter = { type: field.type, val: value, selectedOption: opt };
                            }
                        }
                        break;
                    case 'Date':                        
                        if (!this.grid.disableFilters) {                            
                            var obj = this.grid.filters[this.prefix + id], formater = new ns.DateFormater();
                            if (obj !== undefined) {
                                //  Split for separator option (between, after, ...) and value(s)
                                var valToSplit = obj.split(":"), opt = valToSplit[0];
                                valToSplit.shift();
                                valToSplit = valToSplit.join(":");
                                var value = valToSplit.split(";");
                                
                                header.filter = {
                                    type: field.type,
                                    val: formater.format(new Date(value[0]), format),
                                    selectedOption: opt
                                };                                
                                if (opt === "between") {
                                    //  Add the second value
                                    header.filter["valBetween"] = formater.format(new Date(value[1]), format)
                                }
                            } else {
                                header.filter = { type: field.type, val: undefined, selectedOption: undefined };
                            }
                        }
                        break;
                }
                if (header.sub.depth > this.subDepth) {
                    this.subDepth = header.sub.depth;
                }
                sub.headers.push(header);
            }, context);

            sub.depth = context.subDepth + 1;

            return sub;
        },
        getHeaderIterator: function() {
            return _.bind(
                /*
                 * Breadth-first tree traversal algorithm
                 * adapted to insert a step between each row
                 */
                function(cbBeforeRow, cbCell, cbAfterRow) {
                    var queue = [],
                            cell, row;
                    // initialize queue with a copy of headers
                    _.each(this.headers, function(h) {
                        queue.push(h);
                    });
                    // Iterate over row queue
                    while (queue.length > 0) {
                        row = queue, queue = [];
                        cbBeforeRow(this.depth);
                        while (cell = row.shift()) {
                            // Enqueue sub-headers if any
                            _.each(cell.sub.headers, function(h) {
                                queue.push(h);
                            });
                            // Process the header cell
                            cbCell(cell, this.depth);
                        }
                        cbAfterRow(this.depth);
                        this.depth--;
                    }
                },
                // Bind the tree traversal algorithm to the actual header tree
                this._getSubHeaders(this.collection.model.schema, '')
            );
        },
        serialize: function() {
            // Default view data
            var pagerData = {
                position: this.pagerPosition,
                firstPage: 1,
                lastPage: Math.ceil(this.size / this.pageSize),
                page: this.page,
                totalCount: this.size,
                windowStart: 1,
                windowEnd: this.maxIndexButtons,
                activeFirst: false,
                activePrevious: false,
                activeNext: false,
                activeLast: false,
                showLeftDots: false,
                showRightDots: true
            };

            // Decide what to do with arrow buttons
            if (pagerData.page > pagerData.firstPage) {
                pagerData.activeFirst = true;
                pagerData.activePrevious = true;
            }
            if (pagerData.lastPage !== null && pagerData.page < pagerData.lastPage) {
                pagerData.activeLast = true;
                pagerData.activeNext = true;
            }
            // Compute a window for indexes
            pagerData.windowStart = pagerData.page - Math.floor(this.maxIndexButtons / 2);
            pagerData.windowEnd = pagerData.page + Math.floor(this.maxIndexButtons / 2) + this.maxIndexButtons % 2 - 1;
            if (pagerData.windowStart < pagerData.firstPage) {
                pagerData.windowEnd += pagerData.firstPage - pagerData.windowStart;
                pagerData.windowStart = pagerData.firstPage;
            }
            if (pagerData.windowEnd > pagerData.lastPage) {
                var offset = pagerData.windowEnd - pagerData.lastPage;
                if (pagerData.windowStart > pagerData.firstPage + offset)
                    pagerData.windowStart -= offset;
                pagerData.windowEnd = pagerData.lastPage;
            }
            // Append/Prepend dots where necessary
            pagerData.showRightDots = pagerData.windowEnd < pagerData.lastPage;
            pagerData.showLeftDots = pagerData.windowStart > pagerData.firstPage;

            return {
                pageSizes: this.pageSizes,
                pageSize: this.pageSize,
                headerIterator: this.getHeaderIterator(),
                pager: pagerData,
                filtersDisabled: this.disableFilters
            };
        },
        beforeRender: function() {
            // Clear rows of a previous render
            this.removeViews('table');
            // Add a subview for each grid row

            this.collection.each(function(item) {
                
                var v = new GridRow({
                    model: item,
                    format: this.dateFormat //  set dateFormat for each GridRow
                });
                this.insertView('table', v);
                v.on('selected', function(model) {
                    this.trigger('selected', model);
                }, this);
            }, this);
        },

        afterRender: function() {
            // Allow user to define a datepicker widget
            this.$el.find('th input[type="date"]').each($.proxy(function(idx, elt) {
                this.addDatePicker(elt);
            }, this));
            if (!this.disableFilters && this.$el.find('thead th form.active').length) {
                this.$el.find('.clear-filters button').prop('disabled', false);
            }
        },
        addDatePicker: function(element) {
            // Can be overridden by users to activate a custom datepicker on date inputs
        },
        onPageRedim: function(e) {
            var $select = $(e.target),
                    size = parseInt($select.val());
            if (!isNaN(size))
                this.trigger('pagesize', size);
        },
        onPage: function(e) {
            var $pageButton = $(e.target),
                    target = parseInt($pageButton.data('target'));
            if (!isNaN(target))
                this.trigger('page', target);
        },
        onNumberInput: function(e) {
            var $input = $(e.target),
                    val = $input.val();
            $input.toggleClass('error', val != '' && !this._numberRegexp.test(val));
        },
        clearAllFilters: function(e) {
            this.trigger('unfilter');
        },
        clearFilter: function(e) {
            var $form = $(e.target);
            this.trigger('unfilter', $form.data('id'));
            $form.find('.error').removeClass('error');
            $form.parents('.filter-form').hide();
        },
        addFilter: function(e) {
            e.preventDefault();
            var $form = $(e.target),
                    key = $form.data('id');
            switch ($form.data('type')) {
                case 'Text':
                    var options = $form.find('input[type="radio"][checked="checked"]').val();
                    var val = $form.find('[name="val"]').val();
                    val = $.trim(val);
                    switch (options) {
                            case "same" : 
                            val = "exact:" + val;
                            break;
                            case "begins" : 
                            val = "begin:" + val;
                            break;
                            case "ends" : 
                            val = "end:" + val;
                            break;
                            case "contains" : 
                            break;
                    }        
                    break;
                case 'Number':
                    var val = $form.find('[name="val"]').val();
                    val = $.trim(val);
                    if (this._numberRegexp.test(val))
                        val = val.replace(/,/, '.');
                    else
                        val = '';
                    break;
                case 'Date':
                    var options = $form.find('input[type="radio"][checked="checked"]').val();
                    
                    if (_.contains(["same", "between", "after", "before"], options)) {
                        //  options with value
                        var val = $.trim($form.find('[name="val"]').val()),
                            parts,
                            formater = new ns.DateFormater();;
                        
                        if (options === "between") {
                            var firstVal = val, secondVal = $form.find(".valBetween").val();
                            //if (!/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(secondVal) || !/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(firstVal)) {  adaptation ERD
                            if (!/^\d{2,4}\-\d{1,2}\-\d{1,2}$/.test(secondVal) || !/^\d{2,4}\-\d{1,2}\-\d{1,2}$/.test(firstVal)){
                                val = '';
                                break;
                            }

                            if (secondVal == firstVal ){
                                val = firstVal;
                            } else {
                                var dateMin,dateMax;
                                if (secondVal > firstVal){
                                    dateMin = firstVal;
                                    dateMax = secondVal;
                                } else {
                                    dateMin = secondVal;
                                    dateMax = firstVal;
                                }
                                // between -> interval of time that integrate two borns, so before -> before dateMax + 1 day && after -> after dateMin - 1
                                var dtMax = new Date(dateMax);
                                var dtMin = new Date(dateMin);
                                // convert date to format "yyyy-mm-dd"
                                var dtMaxMonth = dtMax.getMonth()+1;
                                var dtMaxDay = dtMax.getDate() + 1;
                                 var dtMinMonth = dtMin.getMonth()+1;
                                var dtMinDay = dtMin.getDate() - 1;

                                // convert format month "MM"
                                if (dtMaxMonth <10) {dtMaxMonth = "0" + dtMaxMonth;}  
                                if (dtMaxDay <10) {dtMaxDay = "0" + dtMaxDay;}   
                                if (dtMinMonth <10) {dtMinMonth = "0" + dtMinMonth;}  
                                if (dtMinDay <10) {dtMinDay = "0" + dtMinDay;}     

                                var strDateMax = dtMax.getFullYear() + "-" + dtMaxMonth +"-" + dtMaxDay;
                                var strDateMin = dtMin.getFullYear() + "-" + dtMinMonth +"-" + dtMinDay;
                             
                                 val = "before:" + strDateMax +"&filters[]=DATE:after:" + strDateMin;

                            }

                        } else {
                            //if (!/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(val)) {     //adaptation to ERD
                                 if (!/^\d{2,4}\-\d{1,2}\-\d{1,2}$/.test(val)) {
                                val = '';
                                break;
                            } else if (options !="same"){
                               val = options + ":" + val; 
                            }


                            //val = formater.getDate(val, this.dateFormat).toISOString(); //adaptation to ERD



                            // Beware of new Date(s), if s is 01/10/2012, it is interpreted as Jan 10, 2012
                            /*parts   = val.split('/');
                            var year = (parts[2].length < 4) ? parseInt(parts[2]) + 2000 : parts[2];
                            val     = new Date(parts[2], parts[1] - 1, parts[0]);
                            if (isFinite(val)) {
                                // Remove TZ offset
                                // FIXME: it should be possible to handle TZ in a clever way, I have to investigate...
                                // Note that the problem comes from the server data which pretend to be UTC but is not
                                val.setMinutes(val.getMinutes() - val.getTimezoneOffset());
                                val = val.toISOString();
                            } else {
                                val = '';
                            }*/
                        }
                        
                    } else {
                        //  predefined value
                        var today = new Date();
                        var strDate ; 
                        today.setHours(1, 0, 0, 0, 0);
                        
                        switch (options) {
                            case "lastYear" : 
                                var lastYear = new Date(today);
                                lastYear.setFullYear( lastYear.getFullYear() - 1);
                                strDate = lastYear.toISOString() ;
                                val = "after:" + strDate.split("T")[0];
                            break;
                            case "lastWeek" : 
                                var lastWeek = new Date(today);
                                lastWeek.setDate( lastWeek.getDate() - 8);
                                strDate = lastWeek.toISOString() ;
                                val = "after:" + strDate.split("T")[0];
                                break;
                            case "lastMonth" : 
                                var lastMonth = new Date(today);
                                lastMonth.setMonth( lastMonth.getMonth() - 1);
                                strDate = lastMonth.toISOString() ;
                                val = "after:" + strDate.split("T")[0];
                                break;
                            case "today" : 
                                strDate = today.toISOString();
                                val = strDate.split("T")[0];
                                break;
                            case "yesterday" : 
                                today.setDate( today.getDate() - 1);
                                strDate = today.toISOString() ;
                                val = strDate.split("T")[0];
                                break;
                        }
                    }
                    break;
                    
                case 'Boolean':
                    var val = $form.find('[name="val"]:checked').val() || '';
                    break;
            }
            if (val == '' && key in this.filters) {
                this.trigger('unfilter', key);
                $form.find('.error').removeClass('error');
            } else if (val != '') {
                //  _.contains( ["Text", "Date"], $form.data('type'));
                if ($form.data('type') === 'Text' || $form.data('type') === "Date") {
                    this.trigger('filter', key, val, $form.find('input[type="radio"][checked="checked"]').val());
                } else {
                    this.trigger('filter', key, val);
                }

                $form.find('.error').removeClass('error');
            }
            $form.parents('.filter-form').hide();
        },
        toggleFilter: function(e) {
            var form = $(e.target).siblings('.filter-form'),
                    isHidden = form.is(':hidden');
            $('.grid .filter-form').hide(); // Close all open forms (on this column or on other columns)
            if (isHidden) {
                form.show();
                form.find('input').first().focus();
            }
        },
        onSort: function(e) {
            var $elt = $(e.target);
            var col = $elt.data('id');
            var currentOrder = $elt.data('order');
            if (currentOrder == 'asc') { // Already sorted (asc), switch to descending order
                this.trigger('sort', col, 'desc');
            } else if (currentOrder == 'desc') { // Already sorted (desc), swtich back to unsorted
                this.trigger('unsort');
            } else { // Not sorted yet, switch to ascending order
                this.trigger('sort', col, 'asc');
            }
        },
                
        onDateFilter: function(event) {
            var form    = $(event.target).closest("form");
            var val     = $(event.target).val();

            if (_.contains(["same", "before", "after", "between"], val)) {
                //  show input
                $(form).find("input[name='val']").show();
                if (val === "between") {
                    $(form).find("#pBetween").show();
                    $(form).find(".valBetween").show();
                } else {
                    $(form).find("#pBetween").hide();
                    $(form).find(".valBetween").hide();
                    $(form).find(".valBetween").val("");
                }
            } else {
                //  hide input
                $(form).find("#pBetween").hide();
                $(form).find(".valBetween").hide();
                $(form).find("input[name='val']").hide();
                $(form).find(".valBetween").val("");
                $(form).find("input[name='val']").val("");
            }
        },
    });

    ns.GridTemplates = {
        'row':
                '<tbody><% for (var i = 0 ; i < data.maxRowSpan ; i++) {' +
                '    %><tr><%' +
                '    _.each(data.attr, function(value, key) {' +
                '        if (_.isArray(value)) {' +
                '            if (value[i] != undefined) { ' +
                '                if (_.isObject(value[i])) {' +
                '                    if (_.isEmpty(value[i]) && i === 0) {' +
                '                        %> <td colspan="<%= value.length %>">&nbsp;</td><%' +
                '                    } else {' +
                '                        _.each(value[i], function(v,k) {' +
                '                            %><td><%= v %></td><%' +
                '                        });' +
                '                    }' +
                '                } else {' +
                '                    if (i == value.length - 1) {' +
                '                        %> <td rowspan="<%= data.maxRowSpan - i %>"><%= value[i] %></td> <%' +
                '                    } else {' +
                '                        %><td><%= value[i] %></td><%' +
                '                    }' +
                '                }' +
                '            } else if (i === 0) {' +
                '                %> <td rowspan="<%= data.maxRowSpan %>">&nbsp; </td> <%' +
                '            }' +
                '        } else if (i === 0) {' +
                '            %><td class="<%=  key  %>"   rowspan="<%= data.maxRowSpan %>"><%= value %></td><%' +
                '        }' +
                '    });' +
                '    %></tr><%' +
                '}%></tbody>',
        'grid': '<div class="grid">' +
                '<% if (data.pager.position != "bottom") { %>' +
                '<div class="pagination pagination-right">' +
                '<div class="pagination-stats">' +
                '<em><%= (data.pager.totalCount > 1) ? data.pager.totalCount + "</em> items" : data.pager.totalCount + "</em> item" %>, ' +
                '<em><%= (data.pager.lastPage > 1) ? data.pager.lastPage + "</em> pages" : data.pager.lastPage + "</em> page" %>' +
                '</div>' +
                '<ul>' +
                '<li class="<% if (!data.pager.activeFirst) { %>disabled"><span>&lt;&lt;</span><% } else { %>"><span data-target="<%= data.pager.firstPage %>">&lt;&lt;</span><% } %></li>' +
                '<li class="<% if (!data.pager.activePrevious) { %>disabled"><span>&lt;</span><% } else { %>"><span data-target="<%= data.pager.page - 1 %>">&lt;</span><% } %></li>' +
                '<% if (data.pager.showLeftDots) { %><li><span>...</span></li><% } %>' +
                '<% for (var i=data.pager.windowStart; i<=data.pager.windowEnd; i++) { if (i == data.pager.page) { %><li class="active"><span><%= i %></span></li><% } else { %><li><span data-target="<%= i %>"><%= i %></span></li><% }} %>' +
                '<% if (data.pager.showRightDots) { %><li><span>...</span></li><% } %>' +
                '<li class="<% if (!data.pager.activeNext) { %>disabled"><span>&gt;</span><% } else { %>"><span data-target="<%= data.pager.page + 1 %>">&gt;</span><% } %></li>' +
                '<li class="<% if (!data.pager.activeLast) { %>disabled"><span>&gt;&gt;</span><% } else { %>"><span data-target="<%= data.pager.lastPage %>">&gt;&gt;</span><% } %></li>' +
                '</ul>' +
                '<span id="pagesize-selector">' +
                '<select name="pagesizes">' +
                '    <% for (var i=0; i<data.pageSizes.length; i++) { %><option<% if (data.pageSizes[i] == data.pageSize) { %> selected="selected"<% } %>><%= data.pageSizes[i] %></option><% } %>' +
                '</select>' +
                'rows per page' +
                '</span>' +
                '<% if (!data.filtersDisabled) { %><span class="clear-filters"><button class="btn clear-filters" disabled>Clear all filters</button></span><% } %>' +
                '</div>' +
                '<% } %>' +
                '<table class="table table-bordered">' +
                '    <thead ><% data.headerIterator(' +
                '        function (depth) {%><tr><%},' +
                '        function (cell, depth) {' +
                '            var colspan = (cell.sub.headers.length > 1) ? \' colspan="\' + cell.sub.headers.length + \'"\' : \'\',' +
                '                rowspan = (depth > 1 && cell.sub.depth === 0) ? \' rowspan="\' + depth + \'"\' : \'\',' +
                '                iconClass = (cell.order == "") ? "icon-sort" : (cell.order == "asc") ? "icon-sort-up" : "icon-sort-down";' +
                '            %><th <%= colspan %><%= rowspan %>><div>' +
                '                <%= cell.title %>' +
                '                <% if (cell.sortable) { %><i class="sort-action <%= iconClass %>" data-order="<%= cell.order %>" data-id="<%= cell.id %>" title="Sort"></i><% } %>' +
                '                <% if (cell.filter) { %> ' +
                '                    <i class="filter-action icon-filter<%= (cell.filter.val ? " active" : "" ) %>" title="Filter"></i>' +
                '                    <div class="filter-form"><form data-type="<%= cell.filter.type %>" data-id="<%= cell.id %>" class="<%= (cell.filter.val ? "active" : "" ) %>">' +
                '                        <div>' +
                '                            <% if (cell.filter.type == "Text") { %>' +
                
                '                               <div class="filterSection">' +
                '                                   <label><input type="radio" name="chooseT" value="same" <% if (cell.filter.selectedOption === "same") { %> checked="checked" <% } %>   /> Exact match</label>' +
                '                                   <label><input type="radio" name="chooseT" value="begins" <% if (cell.filter.selectedOption === "begins") { %> checked="checked" <% } %> /> Begins with</label>' +
                '                                   <label><input type="radio" name="chooseT" value="contains" checked="checked" <% if (cell.filter.selectedOption === "contains") { %> checked="checked" <% } %> /> Contains</label>' +
                '                                   <label><input type="radio" name="chooseT" value="ends"     <% if (cell.filter.selectedOption === "ends")     { %> checked="checked" <% } %> /> Ends by</label>' +
                '                               </div>' +
                
                '                            <input class="filterInput span2" type="text" name="val" value="<%= cell.filter.val || "" %>" />' +
                '                            <% } else if (cell.filter.type == "Number") { %>' +
                '                            <input class="filterInput span2" type="number" name="val" value="<%= cell.filter.val || "" %>" />' +
                '                            <% } else if (cell.filter.type == "Date") { %>' +
                
                '                               <div class="filterSection dateSection">' +
                '                                   <label><input type="radio" name="choose" value="today"     checked="checked"  <% if (cell.filter.selectedOption === "today")      { %> checked="checked" <% } %> /> Today </label>' +
                '                                   <label><input type="radio" name="choose" value="lastWeek"   <% if (cell.filter.selectedOption === "lastWeek")   { %> checked="checked" <% } %> /> Last week</label>' +
                '                                   <label><input type="radio" name="choose" value="lastMonth"  <% if (cell.filter.selectedOption === "lastMonth")  { %> checked="checked" <% } %> /> Last month</label>' +
                '                                   <label><input type="radio" name="choose" value="lastYear"   <% if (cell.filter.selectedOption === "lastYear")   { %> checked="checked" <% } %> /> Last year</label>' +                
                '                                   <br />' +                 
                '                                   <label><input type="radio" name="choose" value="same"      <% if (cell.filter.selectedOption === "same")       { %> checked="checked" <% } %> /> Exact match   </label>' +
                '                                   <label><input type="radio" name="choose" value="before"     <% if (cell.filter.selectedOption === "before")     { %> checked="checked" <% } %> /> Before        </label>' +                
                '                                   <label><input type="radio" name="choose" value="after"      <% if (cell.filter.selectedOption === "after")      { %> checked="checked" <% } %> /> After         </label>' +
                '                                   <label><input type="radio" name="choose" value="between"    <% if (cell.filter.selectedOption === "between")    { %> checked="checked" <% } %> /> Between       </label>' +
                '                               </div> ' +
                
                '                            <input class="filterInput span2 <% if(!_.contains( ["before", "after", "between", "same"], cell.filter.selectedOption)) { %> hide <% } %>" type="date" name="val" value="<%= cell.filter.val || "" %>" />' +
                '                            <label id="pBetween" class="<% if (cell.filter.selectedOption !== "between")   { %>hide <% } %>">And</label>' +
                '                            <input class="filterInput span2 <% if (cell.filter.selectedOption !== "between")   { %>hide <% } %> valBetween" type="date" name="valBetween" value="<%= cell.filter.valBetween || "" %>" />' +
                '                            <% } else if (cell.filter.type == "Boolean") { %>' +
                '                            <div class="span2 filter-form-boolean">' +
                '                            <label class="radio inline"><input type="radio" name="val" value="true"<%= cell.filter.val == "true" ? " checked" : "" %> />True</label>' +
                '                            <label class="radio inline"><input type="radio" name="val" value="false"<%= cell.filter.val == "false" ? " checked" : "" %> />False</label>' +
                '                            </div>' +
                '                            <% } %>' +
                '                            <br/><button class="btn btn-primary" type="submit">Filter</button>' +
                '                            <button class="btn" type="reset">Clear</button>' +
                '                        </div>' +
                '                    </form></div>' +
                '                <% } %>' +
                '            </div></th><%' +
                '        },' +
                '        function (depth) {%></tr><%}) %></thead>' +
                '</table>' +
                '<% if (data.pager.position != "top") { %>' +
                '<div class="pagination pagination-right">' +
                '<div class="pagination-stats">' +
                '<em><%= (data.pager.totalCount > 1) ? data.pager.totalCount + "</em> items" : data.pager.totalCount + "</em> item" %>, ' +
                '<em><%= (data.pager.lastPage > 1) ? data.pager.lastPage + "</em> pages" : data.pager.lastPage + "</em> page" %>' +
                '</div>' +
                '<ul>' +
                '<li class="<% if (!data.pager.activeFirst) { %>disabled"><span>&lt;&lt;</span><% } else { %>"><span data-target="<%= data.pager.firstPage %>">&lt;&lt;</span><% } %></li>' +
                '<li class="<% if (!data.pager.activePrevious) { %>disabled"><span>&lt;</span><% } else { %>"><span data-target="<%= data.pager.page - 1 %>">&lt;</span><% } %></li>' +
                '<% if (data.pager.showLeftDots) { %><li><span>...</span></li><% } %>' +
                '<% for (var i=data.pager.windowStart; i<=data.pager.windowEnd; i++) { if (i == data.pager.page) { %><li class="active"><span><%= i %></span></li><% } else { %><li><span data-target="<%= i %>"><%= i %></span></li><% }} %>' +
                '<% if (data.pager.showRightDots) { %><li><span>...</span></li><% } %>' +
                '<li class="<% if (!data.pager.activeNext) { %>disabled"><span>&gt;</span><% } else { %>"><span data-target="<%= data.pager.page + 1 %>">&gt;</span><% } %></li>' +
                '<li class="<% if (!data.pager.activeLast) { %>disabled"><span>&gt;&gt;</span><% } else { %>"><span data-target="<%= data.pager.lastPage %>">&gt;&gt;</span><% } %></li>' +
                '</ul>' +
                '<span id="pagesize-selector">' +
                '<select name="pagesizes">' +
                '    <% for (var i=0; i<data.pageSizes.length; i++) { %><option<% if (data.pageSizes[i] == data.pageSize) { %> selected="selected"<% } %>><%= data.pageSizes[i] %></option><% } %>' +
                '</select>' +
                'rows per page' +
                '</span>' +
                '<% if (!data.filtersDisabled) { %><span class="clear-filters"><button class="btn clear-filters" disabled>Clear all filters</button></span><% } %>' +
                '</div>' +
                '<% } %>' +
                '</div>'
    };

    ns.DateFormater = function() {
        var lang = (["fr", "en"].indexOf( (navigator.language || navigator.userLanguage) ) > -1) ? (navigator.language || navigator.userLanguage) : "en";
        var month = {
            "en" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "fr" : ["Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec"]
        };   
         var days = {
            "en" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "fr" : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
        };        
        var zeroPad = function(number) {
            return ("0" + number).substr(-2, 2);
        };        
        var dateFunction = function(date, item) {
            switch (item) {                
                case "dd"   : return zeroPad(date.getDate()); break;
                case "d"    : return date.getDate(); break;
                case "mm"   : return zeroPad(date.getMonth() + 1); break;
                case "m"    : return (date.getMonth() + 1); break;
                case "yyyy" : return date.getFullYear(); break;
                case "yy"   : return date.getFullYear().toString().substr(2, 2); break;
            };
        };        
        /**
         * Return the date in string format, ex : 2014-01-23T00:00:00.000Z to 23/01/2014 with dd/mm/yyyy format
         * @param   {Dare}      date            date object
         * @param   {string}    formatString    format for conversion
         * @returns {string}    date formatted in string
         */
        this.format = function(date, formatString) {            
            var res = "";
            
            _.each( formatString.split('/'), function(item) {
                res += dateFunction(date, item) + '/';
            });
            
            return res.substr(0, res.length - 1);                       
        };
        /**
         * Return an object date from date in string and format, ex : 23/01/2014 with dd/mm/yyyy 2014-01-23T00:00:00.000Z
         * @param   {string} strDate    the date in string
         * @param   {string} strFormat  the date format
         * @returns {Date}   date in object
         */
        this.getDate = function(strDate, strFormat) {

            var dateArray   = {};
            var dateSplit   = strDate.split('/');
            var formatSplit = strFormat.split("/");

            _.each(dateSplit, function(value, key) {
                dateArray[ formatSplit[key] ] = dateSplit[key];
            });
                        
            var d = new Date(), month, day, year;

            //  setDate
            if ("dd" in dateArray) {
                day = parseInt(dateArray['dd']);
            } else if ("d" in dateArray) {
                day = parseInt(dateArray['d']);
            }
            //  setMonth
            if ("mm" in dateArray) {
                month = parseInt(dateArray['mm']);
            } else if ("m" in dateArray) {
                month = parseInt(dateArray['m']);
            }            
            //  setYear
            if ("yyyy" in dateArray) {
                year = parseInt(dateArray['yyyy']);
            } else if ("yy" in dateArray) {
                year = parseInt(dateArray['yy']);
            }
            d = new Date(year, month - 1, day)
            if (d.getFullYear() < 2000) {
                d.setFullYear(year + 2000);
            }
            d.setHours(1, 0, 0, 0);            
            return d;
        };
    };
    
    return ns;

})(NS.UI || {});
