/**
 * Created by dridi on 15/09/16.
 */
(function () {
    this.checkboxTree = function () {
        this.selectedItems = [];
        var defaults = {
            selectAll: false, // check true if you want Select All checkbox
            attributes : ['id'], // the attribut to make order by of response
            radioMode: false , // check true if you want radio mode
            radioModeLevel : 0 ,  // check number of level of radio mode
            levelMax : 0 , // level Max
            checkAllLevel : true // check true if you want wen check parent of his will be checked

        }
        this.options = defaults;
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

        if(this.options.radioMode == true && this.options.radioModeLevel == 0){
            this.options.selectAll = false;
        }
    }

    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    checkboxTree.prototype.updateTree = function (id, tree) {
        this.tree = tree;
        this.id = id;
        var item = browseTree.call(this, this.tree, item , 0);
        document.getElementById(this.id).appendChild(item);
    }

    function toggleChildren(Item, collapseSpan) {
        // Store the value of this
        var _ = Item;
        if (_.style.display == 'none') {
            _.style.display = "block";
            collapseSpan.innerHTML = "-";
        } else {
            _.style.display = "none";
            collapseSpan.innerHTML = "+";
        }

    }

    function changeChildren(select, Item) {
        // Store the value of this
        var _ = Item;
        _.childNodes.forEach(function (val) {
            if (val.className.indexOf('item') !== -1) {
                val.childNodes.forEach(function (val) {
                    if (val.localName == 'input') {
                        val.checked = select.checked;
                    }
                })
                val.childNodes.forEach(function (val) {
                    if (val.className.indexOf('children') !== -1  && this.options.checkAllLevel && this.options.selectAll == false) {
                        changeChildren.call(this, select, val);
                    }
                },this);
            }
        },this)
    }

    function checkSelectedList(Item , treeItem) {
        // Store the value of this
        var _ = Item;
        _.childNodes.forEach(function (val) {
                    if (val.localName == 'input' && val.checked == true ) {
                        this.selectedItems.push(treeItem.item);
                    }
        }, this)
    }

    function changeParent(Item) {
        // Store the value of this
        var options = this.options;
        if (Item != undefined) {
            var checked = true;
            var checkbox;
            var _ = Item;
            _.childNodes.forEach(function (val) {
                if (options.selectAll == false && val.localName == 'input') {
                    checkbox = val;
                }
                if (val.className.indexOf('children') !== -1) {
                    val.childNodes.forEach(function (val) {

                        if (options.selectAll == true && val.localName == 'input') {
                            checkbox = val;
                        }

                        if (val.className.indexOf('item') !== -1) {
                            val.childNodes.forEach(function (val) {
                                if (val.localName == 'input' && val.checked == false) {
                                    checked = false;
                                }
                            })
                        }
                    })
                }
            }, this)

            if (checkbox) {
                checkbox.checked = checked;
            }

            if (options.selectAll == false && options.checkAllLevel  && _.parentNode.className.indexOf('children') !== -1) {
                changeParent.call(this, _.parentNode.parentNode);
            }
        }

    }

    function dispatcheChangeEvent() {
        var event = new CustomEvent("checkSelectedItem");
        var items = document.getElementById(this.id).getElementsByClassName("item");
        [].forEach.call(items, function (item) {
            item.dispatchEvent(event);
        });
    }

    function togglecheckbox(Item) {
        // Store the value of this
        var _ = Item;
        _.checked = !_.checked;
    }

    function browseTree(tree, parent,level) {
        var options = this.options;
        var item = document.createDocumentFragment();
        tree.forEach(function (val) {
            var thisItem = document.createElement("div");
            thisItem.className = "item level"+(level+1);
            if( options.radioMode && (options.radioModeLevel == 0 || options.radioModeLevel >= level )) {
                thisItem.className += " radioModeItem";
            }
            if(options.levelMax == 0 ||  level < options.levelMax ) {
                var collapseSpan = document.createElement("span");
                collapseSpan.className = "collapse";
                if (val.children && val.children.length > 0) {
                    collapseSpan.innerHTML = "+";
                }
                thisItem.appendChild(collapseSpan);
            }
            var checkbox = document.createElement("input");
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('value', val.item.value);
            var caption = document.createElement("span");
            caption.innerHTML = val.item.name;
            thisItem.appendChild(checkbox);
            thisItem.appendChild(caption);
            caption.addEventListener('click', function () {
                togglecheckbox.call(this, checkbox);
                if(this.options.checkAllLevel)
                changeParent.call(this, parent);
                dispatcheChangeEvent.call(this);
            }.bind(this));
            checkbox.addEventListener('change', function () {
                if(this.options.checkAllLevel)
                changeParent.call(this, parent);
                dispatcheChangeEvent.call(this);
            }.bind(this));
            if (val.children && val.children.length > 0) {
                var children = document.createElement("div");
                children.className = 'children';
                children.style.display = 'none';
                if (options.selectAll == true) {
                    if( !options.radioMode || (options.radioModeLevel != 0 && options.radioModeLevel < level+1)) {
                        var selectAll = document.createElement("input");
                        selectAll.setAttribute('type', 'checkbox');
                        selectAll.className = 'selectAll';
                        var captionAll = document.createElement("span");
                        captionAll.innerHTML = 'select all';
                        children.appendChild(selectAll);
                        children.appendChild(captionAll);
                        captionAll.addEventListener('click', function () {
                            togglecheckbox.call(this, selectAll);
                            changeChildren.call(this, selectAll, children);
                            dispatcheChangeEvent.call(this);
                        }.bind(this));
                        selectAll.addEventListener('change', function () {
                            changeChildren.call(this, selectAll, children);
                            dispatcheChangeEvent.call(this);
                        }.bind(this));
                    }
                } else {
                    caption.addEventListener('click', function () {
                        if(this.options.checkAllLevel)
                        changeChildren.call(this, checkbox, children);
                        dispatcheChangeEvent.call(this);
                    }.bind(this));
                    checkbox.addEventListener('change', function () {
                        if(this.options.checkAllLevel)
                        changeChildren.call(this, checkbox, children);
                        dispatcheChangeEvent.call(this);
                    }.bind(this));
                }

                if(options.levelMax == 0 || level < options.levelMax ) {
                    children.appendChild(browseTree.call(this, val.children, thisItem , level + 1));
                    thisItem.appendChild(children);
                }else{
                    item.appendChild(browseTree.call(this, val.children, thisItem , level + 1));
                }
                if(options.levelMax == 0 ||  level < options.levelMax ) {
                    collapseSpan.addEventListener('click', function () {
                        toggleChildren.call(this, children, collapseSpan);
                    }.bind(this));
                }

            }
            item.appendChild(thisItem);
            thisItem.addEventListener('checkSelectedItem',function(){
                checkSelectedList.call(this, thisItem , val);
            }.bind(this));

        }, this);
        return item;
    }

}());
