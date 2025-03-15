# Open CMS Preview Module
This module allows you to open the CMS preview panel from any page in the CMS that has a form.

### Installation
To install the module, use Composer:

``` bash
composer require toastnz/open-cms-preview
```

### Usage
To use the module, simply add the following form field to any form in the CMS:

``` php
use Toast\OpenCmsPreview\Fields\OpenCmsPreview;

public function getCMSFields()
{
    $fields = parent::getCMSFields();

    $fields->addFieldsToTab('Root.Main', [
        OpenCmsPreview::create($this->getPreviewLink());
    ]);

    return $fields;
}

public function getPreviewLink()
{
    // Return the link to the page you want to preview
}
```

### Extending the controller
The module adds a new OpenCMSPreviewController to the window which you can extend to add custom functionality.

The refresh event is called when the Controller observes an ajax / fetch event with some basic and conditional checks to determine when the refresh should be called or prevented. You can use the on('beforeRefresh') event to add custom functionality before the refresh is called.

Additionally you can call event.preventRefresh(); to prevent the refresh from being called.

``` js
// Example usage
window.OpenCMSPreviewController.on('beforeRefresh', (event) => {
    // This event data also includes the ajax / fetch response
    console.log(event.data);

    // Prevent the refresh from being called if some condition is met
    if (event.data.someKey == 'someValue') {
        event.preventRefresh();
    }
});
```

You also have access to a few other events:

``` js

// When the refresh is complete
on('refresh', (iframeSrc) => {});

// Before the preview refresh script has run
on('beforeRefresh', (event) => {});

// After the preview has been added to the page
on('addPreview', (previewElement) => {});

// After the preview has been removed from the page
on('removePreview', () => {});
