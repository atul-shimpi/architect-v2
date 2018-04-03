<?php namespace Vebto\Appearance;

use File;
use Leafo\ScssPhp\Block;
use Leafo\ScssPhp\Compiler;
use Leafo\ScssPhp\Parser;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class CssThemeGenerator
{
    private $variables = [
        'site-accent-color',
        'site-primary-color-100',
        'site-primary-color-200',
        'site-bg-color-100',
        'site-bg-color-200',
        'site-bg-color-300',
        'site-bg-color-400',
        'site-text-color-100',
        'site-text-color-200',
        'site-text-color-300',
        'site-text-color-400',
        'site-border-color-100',
        'site-border-color-200',
    ];

    private $matches = [];

    public function generate()
    {
        $dirs = [base_path('../client/src/app'), base_path('../client/node_modules/vebto-client')];
        $parser = new Parser(null);

        $files = iterator_to_array(Finder::create()->name('*.scss')->files()->in($dirs), false);

        foreach ($files as $file) {
            $tree = $parser->parse(file_get_contents($file->getRealPath()));
            $this->parseSassBlock($tree);
        }

        $this->generateCss();
    }

    /**
     * Generate a valid css file from sass files of components that contain variables.
     *
     * @return string
     */
    private function generateCss()
    {
        $grouped = $this->groupMatchesByVariable();
        $css = '';

        foreach ($grouped as $variable => $group) {
            foreach ($group as $property => $matches) {

                //prepend '#theme' to all selectors
                $selectors = array_map(function($match) {
                    return $this->prependThemePrefixToSelector($match['selector']);
                }, $matches);

                $selectors = join($selectors, ",\n");

                $css .= "$selectors\n{\n\t$property: var(--$variable);\n}\n\n";
            }
        }

        $rootBlock = $this->generateCssVariablesRootBlock();

        $css = $rootBlock . $css;

        File::put(resource_path('editable-theme.css'), $css);

        return $css;
    }

    /**
     * Generate css :root block containing variables.
     *
     * @return string
     */
    private function generateCssVariablesRootBlock()
    {
        $sassVars = $this->getSassVariableFileContents();

        $variables = collect($this->variables)->mapWithKeys(function($variable) use($sassVars) {
            return [$variable => $this->extractVariableValue($sassVars, $variable)];
        })->map(function($value, $name) {
            return "\t--$name: $value;";
        })->implode("\n");

        return ":root {\n$variables\n}\n\n";
    }

    /**
     * Get contents of all _variables.scss files.
     *
     * @return string
     */
    private function getSassVariableFileContents()
    {
        $dirs = [base_path('../client/src/'), base_path('../client/node_modules/vebto-client')];

        $files = iterator_to_array(Finder::create()->name('*_variables.scss')->files()->in($dirs), false);

        return collect($files)->map(function(SplFileInfo $file) {
            return File::get($file->getRealPath());
        })->implode('');
    }

    /**
     * Extract specified sass variable value recursively.
     *
     * @param string $sass
     * @param string $variable
     * @return string
     */
    private function extractVariableValue($sass, $variable)
    {
        //extract value from sass map
        if (str_contains($variable, 'map_get')) {
            $materialSass = file_get_contents(base_path('../client/node_modules/@angular/material/_theming.scss'));
            preg_match("/map_get\((.+?),.([0-9]+)\)/", $variable, $matches);
            $mapName = '\\'.$matches[1];
            $varName = $matches[2];

            preg_match("/$mapName:.\(.+?$varName:.(#[a-z0-9]+),/s", $materialSass, $matches);
            return $matches[1];
        }

        $variable = str_replace('$', '', $variable);
        $variable = '\$'.$variable;
        preg_match("/$variable:(.+?);/", $sass, $matches);

        $value = trim(str_replace('!default', '', $matches[1]));

        if (str_contains($value, '$')) {
            $value = $this->extractVariableValue($sass, $value);
        }

        return $value;
    }

    /**
     * Group all matches by variable name and then by css property name.
     *
     * @return array
     */
    private function groupMatchesByVariable() {
        $grouped = [];

        //group matches by variable, example "site-bg-color-400"
        foreach ($this->matches as $match) {
            $grouped[$match['variable']][] = $match;
        }

        //group each variable group by property name, example: "border-color"
        foreach ($grouped as $groupName => $group) {
            foreach ($group as $matchKey => $match) {
                $grouped[$groupName][$match['property']][] = $match;
                unset($grouped[$groupName][$matchKey]);
            }
        }

        return $this->addMaterialSelectorsToGroupedVariables($grouped);
    }

    /**
     * @param Block $block
     */
    private function parseSassBlock(Block $block)
    {
        foreach ($block->children as $child) {
            $childType = $child[0];
            $childBlock = $child[1];

            if ($childType === 'block') {
                if ($block->selectors) $childBlock->parent = $block;
                $this->getSelectorsFromBlock($childBlock);
                $this->parseSassBlock($childBlock);
            }
        }
    }

    /**
     * Extract css selectors that contain variables from specified sass block.
     *
     * @param Block $block
     */
    private function getSelectorsFromBlock(Block $block) {
        foreach ($block->children as $child) {
            $childType = $child[0];

            if ($childType === 'assign') {
                $assignKey = $child[1][2][0];
                $assignValueType = $child[2][0];
                $variableName = $this->getVariableNameFromSassValue($child);

                $variableIndex = array_search($variableName, $this->variables);

                if ($variableIndex === false) continue;

                if ($assignValueType === 'list' && str_contains($assignKey, 'border')) {
                    $this->addMatch($block, 'border-color', $variableIndex);
                }

                else if ($assignValueType === 'var' && $variableIndex > -1) {
                    $this->addMatch($block, $assignKey, $variableIndex);
                }
            }
        }
    }

    /**
     * Extract variable name from block child.
     *
     * @param array $blockChild
     * @return string|null;
     */
    private function getVariableNameFromSassValue($blockChild)
    {
        if ( ! is_array($blockChild[2])) return null;

        $flattened = array_flatten($blockChild[2]);

        foreach ($flattened as $key => $value) {
            if ($value === 'var') {
                return $flattened[$key+1];
            }
        }
    }

    /**
     * @param Block $block
     * @param $assignKey
     * @param $variableIndex
     */
    private function addMatch(Block $block, $assignKey, $variableIndex)
    {
        $parent = $this->makeParentSelector($block);
        $child  = $this->makeSelectorString($block->selectors);
        $parts = explode(',', $child);

        //add parent selector before each selector separated by comma
        $selector = array_map(function($part) use($parent) {
            return "$parent $part";
        }, $parts);

        $selector = implode(', ', $selector);

        //convert sass '&' symbols into css, by simply removing them and surrounding spaces
        $selector = str_replace([' &', '& '], '', $selector);

        $this->matches[] = [
            'selector' => $selector,
            'property' => $assignKey,
            'variable' => $this->variables[$variableIndex],
        ];
    }

    /**
     * Generate selectors string from specified sass selectors array.
     *
     * @param array $selectors
     * @return string
     */
    private function makeSelectorString($selectors)
    {
        $string = '';

        foreach ($selectors as $key => $selector) {
            foreach ($selector as $selectorPart) {
                foreach ($selectorPart as $innerPart) {
                    if (is_string($innerPart)) {
                        $string .= $innerPart;

                        if ($innerPart === '>') {
                            $string .= ' ';
                        }
                    } else if ($innerPart[0] === 'self') {
                        $string .= '&';
                    } else if ($innerPart[0] === 'string' && isset($innerPart[2])) {
                        $string .= $innerPart[2][0];

                    }
                }
            }

            if (isset($selectors[$key+1])) {
                $string .= ', ';
            }
        }

        return $string;
    }

    /**
     * Generate parent selector to the root parent for specified block.
     *
     * @param Block $block
     * @return string
     */
    private function makeParentSelector(Block $block)
    {
        $parent = isset($block->parent) ? $block->parent : null;
        $parentSelector = [];

        while ($parent) {
            $parentSelector[] = $this->makeSelectorString($parent->selectors);
            $parent = isset($parent->parent) ? $parent->parent : null;
        }

        //compile parent selector into a string
        return join(array_reverse($parentSelector), ' ');
    }

    /**
     * Prepend "#theme" prefix to all specified selector parts.
     *
     * @param string $selector
     * @return string
     */
    private function prependThemePrefixToSelector($selector)
    {
        $parts = explode(',', $selector);

        $parts = array_map(function($selectorPart) {
            return '#theme '.trim($selectorPart);
        }, $parts);

        return implode(', ', $parts);
    }

    /**
     * Add angular material specific accent selectors to the theme.
     *
     * @param array $grouped
     * @return array
     */
    private function addMaterialSelectorsToGroupedVariables($grouped)
    {
        $grouped['site-accent-color']['background-color'][] = [
            'selector' => '.mat-raised-button.mat-accent:not([disabled]), .mat-fab.mat-accent, .mat-mini-fab.mat-accent',
        ];

        $grouped['site-accent-color']['background-color'][] = [
            'selector' => '.mat-checkbox-checked.mat-accent .mat-checkbox-background, .mat-checkbox-indeterminate.mat-accent .mat-checkbox-background',
        ];

        $grouped['site-accent-color']['color'][] = [
            'selector' => ' .mat-button.mat-accent, .mat-icon-button.mat-accent'
        ];

        return $grouped;
    }
}