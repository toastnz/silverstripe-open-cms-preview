<?php

namespace Toast\OpenCmsPreview\Fields;

use SilverStripe\View\Requirements;
use SilverStripe\Forms\HiddenField;

class OpenCmsPreview extends HiddenField
{
    public function __construct($name, $title = null, $value = null)
    {
        // We only want to pass in the $name, we will auto generate the actual name and title to make it easier for the developer
        $value = $name;

        // Update the name and title
        $name = 'OpenCMSPreview';
        $title = 'OpenCMSPreview';

        // Call the parent constructor
        parent::__construct($name, $title, $value);
    }

    public function Field($properties = [])
    {
        Requirements::css('toastnz/open-cms-preview: client/dist/styles/index.css');
        Requirements::javascript('toastnz/open-cms-preview: client/dist/scripts/index.js');

        return parent::Field($properties);
    }
}
