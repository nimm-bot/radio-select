class RadioSelect {
    /**
     * Toggling element to bind events and object instance to. 
     */
    elem = null;

    /**
     * Original select element.
     */
    select = null;

    /**
     * Container template to wrap radio list into. Must be accessible via [data-radio-select-container] selector.
     * 
     * Replaceable strings:
     * {toggle} - REQUIRED - expands and collapses radio list. Toggle template is described by "toggleTemplate" property.
     * {options} - REQUIRED - contains radio list. Individual option wrapper is described by "optionTemplate" property.
     */
    template = '<div aria-expanded="false" data-radio-select-container>{toggle}{options}</div>';

    /**
     * Template for toggle element. Must be accessible via [data-radio-select-toggle] selector.
     */
    toggleTemplate = '<div data-radio-select-toggle tabindex="0"><div data-radio-select-label></div></div>';

    /**
     * Template for individual options within radio list. 
     * 
     * Replaceable strings:
     * {input} - fixed to INPUT element with radio or checkbox types (checkbox if "multiple" property is true). Inherits all attributes from OPTIONs of select and select's name.
     * {icon} - if present, draws an icon based on "iconTemplate" property.
     * {label} - is replaced with OPTION's inner text.
     */
    optionTemplate = '<div class="option" tabindex="0">{input}<div data-radio-select-label>{icon}{label}</div></div>';

    /**
     * Template for radio list icons. Defaults to regular images.
     * 
     * Replaceable strings:
     * {iconPath} - Corresponds to generating option's "data-radio-select-icon". If this property is not present in an option, icon won't be drawn. 
     * Used as images "src" property by default, but can be replaced with Font Awesome / Bootstrap classes, SVG paths and so on.
     */
    iconTemplate = '<div class="icon"><img src="{iconPath}"/></div>';

    /**
     * If true, replaces options with checkboxes instead and allows multiple selection.
     */
    multiple = true;

    /**
     * Class constructor
     * 
     * @param {*} select - SELECT element to generate radio list from.
     * @param {*} options - if given, replaces default class properties.
     * @returns 
     */
    constructor(select, options = {}) {
        if (select.tagName !== 'SELECT') {
            console.warn('Please use a SELECT element for initialization.');

            return false;
        }

        let optionKeys = Object.keys(options);

        for (let i = 0; i < optionKeys.length; i++) {
            if (this[optionKeys[i]] !== undefined) {
                this[optionKeys[i]] = options[optionKeys[i]];
            }
        }

        this.select = select;

        this.#generateRadioList();
        this.elem = this.select.previousSibling.querySelector('[data-radio-select-toggle]');
        this.#bindEvents();
        this.elem.closest('[data-radio-select-container]').parentNode.removeChild(this.select);

        this.elem.RadioSelect = this;
    }

    /**
     * Unbind global events and replace radio list with initial select.
     */
    destroy() {
        let elem = this.elem;

        elem.parentNode.insertBefore(this.select, elem);
        elem.closest('body').removeEventListener('click', this.#collapseOpenRadioSelect);
        delete elem.RadioSelect;

        elem.parentNode.removeChild(elem);
    }

    /**
     * Generates radio input list based on original select.
     */
    #generateRadioList() {
        let _this = this;
        let allOptionStr = '';

        // Generate radio list and append before original select element.
        this.select.querySelectorAll('option').forEach(function (option) {
            allOptionStr += _this.#optionToRadio(option);
        });

        let str = this.template.replace('{toggle}', this.toggleTemplate)
            .replace('{options}', '<div data-radio-select-options>' + allOptionStr + '</div>');

        this.select.before(
            (new DOMParser()).parseFromString(str, 'text/html').body.firstChild
        );

        // Replace toggle element label with text of selected options.
        let radioList = this.select.previousSibling;
        let checkedElement = radioList.querySelector('input:checked');

        if (checkedElement !== null) {
            if (checkedElement.getAttribute('hidden') !== undefined) {
                checkedElement.closest('.option').classList.add('placeholder');
            }

            radioList.querySelector('[data-radio-select-toggle] [data-radio-select-label]').innerHTML = checkedElement.closest('.option').querySelector('[data-radio-select-label]').innerHTML;
        }
    }

    /**
     * Generates radio or checkbox input based on given option HTML.
     * 
     * @param {*} option 
     * @returns 
     */
    #optionToRadio (option) {
        let iconPath = option.getAttribute('data-radio-select-icon');
        let optionStr = this.optionTemplate
            .replace('{icon}', iconPath === null || iconPath === undefined
                ? ''
                : this.iconTemplate.replace('{iconPath}', iconPath))
            .replace('{label}', option.text)
            .replace('{input}', this.multiple ? '<input type="checkbox"/>' : '<input type="radio"/>');

        let dummyOption = (new DOMParser()).parseFromString(optionStr, 'text/html').body.firstChild;
        let dummyInput = dummyOption.querySelector('input');

        for (let i = 0; i < option.attributes.length; i++) {
            if (option.attributes[i].name === 'selected') {
                dummyInput.setAttribute(
                    'checked', 
                    option.attributes[i].value === 'selected'
                        ? 'checked'
                        : option.attributes[i].value
                );
            } else {
                dummyInput.setAttribute(option.attributes[i].name, option.attributes[i].value);
            }
        }

        dummyInput.setAttribute('name', this.select.getAttribute('name'));

        return dummyOption.outerHTML;
    }

    /**
     * Binds tab and keyup events to radio list options and its toggle element.
     */
    #bindEvents() {
        let _this = this;
        let container = this.elem.closest('[data-radio-select-container]');

        this.select.closest('body').addEventListener('click', this.#collapseOpenRadioSelect);

        // Toggle actions
        this.elem.addEventListener('click', function (e) {
            _this.#handleToggle();
        });

        this.elem.addEventListener('keyup', function (e) {
            if (e.code === 'Enter') {
                _this.#handleToggle();
            }
        });

        // Select actions
        container.querySelectorAll('[data-radio-select-options] input').forEach(function (item) {
            item.addEventListener('change', function (e) {
                _this.#handleSelect(e.target);
                _this.#handleToggle();
            });
        });

        container.querySelectorAll('[data-radio-select-options] .option').forEach(function (item) {
            item.addEventListener('keyup', function (e) {
                if (container.getAttribute('aria-expanded') === "true" && e.code === 'Enter') {
                    _this.#handleSelect(e.target);
                    _this.#handleToggle();

                    e.target.blur();
                }
            });
        });
    }

    /**
     * Handles toggle event (expand / collapse);
     */
    #handleToggle() {
        let container = this.elem.closest('[data-radio-select-container]');
        let isExpanded = container.getAttribute('aria-expanded') === 'true';

        container.setAttribute('aria-expanded', !isExpanded);

        // Make options selectable with tab when radio list is expanded.
        container.querySelectorAll('[data-radio-select-options] .option').forEach(function (item) {
            item.setAttribute('tabindex', isExpanded ? '-1' : '0');
        });
    }

    /**
     * Handles option selection.
     * 
     * @param {*} option - HTML element. Radio/checkbox input to check.
     */
    #handleSelect(option) {
        let container = option.closest('[data-radio-select-container]');
        let toggle = container.querySelector('[data-radio-select-toggle] [data-radio-select-label]');

        toggle.innerHTML = '';

        if (this.multiple) {
            let labelStr = '';
            let selectedOptions = container.querySelectorAll('[data-radio-select-options] input:checked');

            selectedOptions.forEach(function (selected) {
                if (selectedOptions.length === 1 || selected.getAttribute('disabled') === null) {
                    labelStr += '<div class="multiple-item">' + selected.closest('.option').querySelector('[data-radio-select-label]').innerHTML + '</div>';
                }
            });

            // Toggle receives a composite label of all selected options.
            toggle.innerHTML = labelStr;
        } else {
            // Toggle receives a label of selected option.
            toggle.innerHTML = option.closest('.option').querySelector('[data-radio-select-label]').innerHTML;
        }

        // Disable option selection with tabs when radio list is collapsed.
        this.elem.closest('[data-radio-select-container]').querySelectorAll('[data-radio-select-options] .option').forEach(function (item) {
            item.setAttribute('tabindex', '-1');
        });
    }

    /**
     * Global even for collapsing opened radio lists when page is clicked anywhere else.
     * 
     * @param {*} e 
     */
    #collapseOpenRadioSelect(e) {
        let container = e.target.closest('[data-radio-select-container]');

        if (container === null) {
            this.closest('body').querySelectorAll('[data-radio-select-toggle]').forEach(function (item) {
                let openContainer = item.closest('[data-radio-select-container]');
                
                if (openContainer.getAttribute('aria-expanded') !== 'false') {
                    openContainer.setAttribute('aria-expanded', false);
                }
            });
        }
    }
}
