<?php

namespace App\Console\Commands;

use Illuminate\Console\GeneratorCommand;

class PipelineMakeCommand extends GeneratorCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $name = 'make:pipeline';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new pipeline class';

    /**
     * The type of class being generated.
     *
     * @var string
     */
    protected $type = 'Pipeline';

    /**
     * Get the stub file for the generator.
     *
     * @return string
     */
    protected function getStub()
    {
        return base_path('stubs/pipeline.stub');
    }

    /**
     * Get the default namespace for the class.
     *
     * @param  string  $rootNamespace
     * @return string
     */
    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Pipelines';
    }

    /**
     * Replace the class name for the given stub.
     *
     * @param  string  $stub
     * @param  string  $name
     * @return string
     */
    protected function replaceClass($stub, $name)
    {
        $namespace = str_replace('/', '\\', trim($this->argument('name')));
        $class = str_replace($this->getNamespace($name).'\\', '', $name);

        return str_replace(['DummyNamespace', 'DummyClass'], [$namespace.'\\Pipelines', $class], $stub);
    }
}
