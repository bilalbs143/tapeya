<?php

namespace Tests;

use App\Support\EnsureSpatieSettingsDatabaseProperties;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Tests\Support\Scoring\BallFactory;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        BallFactory::resetIds();
        EnsureSpatieSettingsDatabaseProperties::ensure();
    }
}
