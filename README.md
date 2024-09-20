# radio-select
 A lightweight library that generates radio list from select element. Allows for easier select styling, without compromising its input functionality.

 Radio-Select serves more as a front-end portfolio piece, than a reliable library for wider application. If You come looking for those, please check out Select2, SlimSelect, Bootstrap, or other professional works.

## Installation
Include files from src subdirectories to head section of Your page.

```
<script src="{containting_directory}/radio-select.js" type="text/javascript"></script>
<link href="{containting_directory}/src/css/radio-select.css" rel="stylesheet">
```
... or use CDN from GitHub repository:
```
<script src="https://nimm-bot.github.io/radio-select/src/js/radio-select.js" type="text/javascript"></script>
<link href="https://nimm-bot.github.io/radio-select/src/css/radio-select.css" rel="stylesheet">
```
After linking the files, append this JS snippet to document's onload event or as a script tag after select element:

```
// Query selector may differ, but generating element must have SELECT tagName.
new RadioSelect(document.querySelector('select'), {});
```

And You're set!

## Class constructor and options
Class constructor accepts 2 arguments, first being a select element that generates a radio/checkbox list. Second is a JSON object to overwrite class properties.

Available options:

* **template** (string) - Container template to wrap radio list into. Must be accessible via [data-radio-select-container] selector.
Includes replaceable strings:
{toggle} - REQUIRED - expands and collapses radio list. Toggle template is described by "toggleTemplate" property.
{options} - REQUIRED - contains radio list. Individual option wrapper is described by "optionTemplate" property.

* **toggleTemplate** (string) - Template for toggling element. Must be accessible via [data-radio-select-toggle] selector.

* **optionTemplate** (string) - Template for individual options within radio list.
Contains replaceable strings:
{input} - fixed to INPUT element with radio or checkbox types (checkbox if "multiple" property is true). Inherits all attributes from OPTIONs of select and select's name.
{icon} - if present, draws an icon based on "iconTemplate" property.
{label} - is replaced with OPTION's inner text.

* **iconTemplate** (string) - Template for radio list icons. Defaults to including img elements.
Contains replaceable strings:
{iconPath} - Corresponds to generating option's "data-radio-select-icon". If this property is not present in an option, icon won't be drawn.
Used as images "src" property by default, but can be replaced with Font Awesome / Bootstrap classes, SVG paths and so on.

* **multiple** (bool) - If true, replaces options with checkboxes instead of radio buttons, and allows multiple selection.

## Methods
Method list consists only of constructor and garbage collection via destroy().

* **new RadioSelect(elem, properties)** - class constructor. Generates radio / checkbox input list form options of given select.
**elem** - HTML select element;
**properties** - JSON object to overwrite class defaults.
Initial select is replaced with a RadioSelect structure, but its data is saved in an object instance, bound to toggling element.

* **destroy()** - restores initial select and removes global events related to RadioSelect instance.

For examples please see demo.html.
