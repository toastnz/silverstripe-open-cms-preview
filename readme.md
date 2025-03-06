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
