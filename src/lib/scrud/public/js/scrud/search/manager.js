/*global ActionModel */
var SearchScrudManager;
(function(){
    "use strict";
    /**
    * @class TemplateManager
    * @constructor
    * @property {ActionModel} action Instance of ActionModel
    * @description  Manage template
    */
    SearchScrudManager = function (){
        extendSingleton(SearchScrudManager);
        this.basePath = "scrud/"+$("table").attr("action")+"/list";
        this.timer;
        this.pagination;
        this.isAvailable = true;
        this.body = $("tbody");
        this.th = $("th");
        this.actionModel = $("table").attr("action");
        this.action = ActionModel.getInstance();
        this.manager = ManagerModel.getInstance();
    };

    SearchScrudManager.getInstance = function(){
        return getSingleton(SearchScrudManager);
    };

    SearchScrudManager.prototype.findValue = function(value, cb, container){
        var search = $(container).parent();
        var model = search.find("#field :selected").parent().attr("label");
        var data = {
            field:search.find("#field :selected").val(),
            value:value
        };
        ActionModel.getInstance().apiNoLoad(model+"/complete", data, check);

        function check(data){
            cb(data.data);
        }
    };

    SearchScrudManager.prototype.getPage = function(currentPage){
        var that = this;
        if(!this.isAvailable){
            return false;
        }
        this.isAvailable = false;
        this.action.getHtml(this.basePath, {
            currentPage:currentPage,
            fields: getFields(),
            filters: getFilters()
        }, appendResult);

        function appendResult(html){
            var data = that.manager.getVars(html);
            that.body.empty().append($(html).find("tr"));            
            that.isAvailable = true;
            
            that.pagination.nbPage = Number(data.nbPage);
            that.pagination.init(currentPage);
            that.manager.init(that.body);
        }

        function getFields(){
            var fields = [];
            that.th.each(addField);
            return fields;

            function addField(i, element){
                fields.push($(element).attr("id"));
            }
        }

        function getFilters(){
            var filters = {};
            $(".filter").each(addFilter);
            return filters;

            function addFilter(i, element){
                var field = $(element).find("#field").text();
                var type = $(element).find("#type").text();
                var value = $(element).find("#value").text();
                if(!isDefined(filters[field])){
                    filters[field] = [];
                }
                filters[field].push({
                    value: value,
                    type: type
                });
            }
        }
        
    };

    SearchScrudManager.prototype.selectValue = function(element, container){
        var search = $(container).parent();
        var searchContainer = $(container).parent().parent();
        var filter = searchContainer.find(".filter.hide").clone();
        filter.find("#field").text(search.find("#field :selected").val());
        filter.find("#type").text(search.find(".type:not(.hide) :selected").val());
        filter.find("#value").text($(element).text());
        searchContainer.append(filter);
        this.manager.init(filter.removeClass("hide"));
        search.find("#field option:eq(0)").attr("selected", true).change();
        this.getPage(1);
    };

    SearchScrudManager.prototype.removeFilter = function(element){
        $(element).parent().remove();
        this.getPage(1);
    };

    SearchScrudManager.prototype.selectField = function(element){
        var that = this;
        var search = $(element).parentsUntil(".search").parent();
        var typeContainer = search.find(".typeContainer");
        var input = search.find("#search");
        var model = $(element).find(':selected').parent().attr("label");
        var field = $(element).find(':selected').val();    

        typeContainer.find("select").addClass("hide");
        clearTimeout(this.timer);
        if(field === ""){
            input.attr('disabled', '').val("");
            return false;
        }
        this.timer = setTimeout(getType, 200);

        function getType(){
            that.action.api(model+'/getType', {field:field}, showSelectType);
        }

        function showSelectType(data){                       
            input.removeAttr('disabled').val("");
            var selectType;
            var type;
            switch(data.data){
                case 'int':
                case 'bigint':
                case 'tinyint':
                case 'float':
                case 'double':
                    selectType = 'numeric';
                    type = 'number';
                    break;
                default :
                    type='text';
                    selectType = 'text';
                    break;
            }
            typeContainer.find("#"+selectType).removeClass("hide");
            typeContainer.find("#"+selectType+" option:eq(0)").attr("selected", true);
            input.attr("type", type);

            setTimeout(asyncFocus, 0);

            function asyncFocus(){
                input.focus();
            }
        }
    };
    
})();