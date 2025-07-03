import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml as yamlLang } from '@codemirror/lang-yaml';
import { linter, Diagnostic } from '@codemirror/lint';
import yaml from 'js-yaml';
import { Parser } from 'expr-eval';
import { useTheme } from '@emotion/react';
import { oneDark } from '@codemirror/theme-one-dark';

const VALID_PRODUCTS = ['DCS-7280CR3A-48D6-R', 'MGMT-AGG-SWITCH', 'A-Care-5YR'];

export default function YamlEditor() {
    const theme = useTheme();
    const [yamlText, setYamlText] = useState(`questions:
  - name: num_racks
    type: integer
    prompt: "How many racks?"
    default: 2

  - name: include_mgmt_aggs
    type: boolean
    prompt: "Include management AGGs?"
    default: false

  - name: support_years
    type: enum
    prompt: "How many years of support?"
    choices: [1, 3, 5]
    default: 3

rules:
  - condition: "num_racks > 2"
    add:
      product: "DCS-7280CR3A-48D6-R"
      quantity: "num_racks * 2"

  - condition: "include_mgmt_aggs == true"
    add:
      product: "MGMT-AGG-SWITCH"
      quantity: 1

  - condition: "support_years == 5"
    add:
      product: "A-Care-5YR"
      quantity: "num_racks * 2"`);

    const validateYamlInline = (text) => {
        const diagnostics = [];
        let parsed;

        try {
            parsed = yaml.load(text);
        } catch (e) {
            diagnostics.push({
                from: 0,
                to: text.length,
                severity: 'error',
                message: `YAML Syntax Error: ${e.message}`,
            });
            return diagnostics;
        }

        const questions = parsed?.questions || [];
        const rules = parsed?.rules || [];
        const questionVars = {};
        const parser = new Parser();
        const lines = text.split('\n');

        const findOffset = (lineNum) => {
            return lines.slice(0, lineNum).reduce((acc, l) => acc + l.length + 1, 0);
        };

        questions.forEach((q, i) => {
            const { name, type, default: def, choices } = q;
            const line = lines.findIndex((l) => l.includes(`name: ${name}`));
            const from = findOffset(line);
            questionVars[name] = def;

            if (type === 'boolean' && choices) {
                diagnostics.push({
                    from,
                    to: from + lines[line].length,
                    severity: 'error',
                    message: `Boolean question '${name}' should not have choices.`,
                });
            }
            if (type === 'enum' && (!Array.isArray(choices) || !choices.includes(def))) {
                diagnostics.push({
                    from,
                    to: from + lines[line].length,
                    severity: 'error',
                    message: `Enum question '${name}' has invalid choices or default.`,
                });
            }
        });

        rules.forEach((rule) => {
            const { condition, add } = rule;
            const { product, quantity } = add || {};
            const line = lines.findIndex((l) => l.includes(product));
            const from = findOffset(line);

            if (!VALID_PRODUCTS.includes(product)) {
                diagnostics.push({
                    from,
                    to: from + lines[line].length,
                    severity: 'error',
                    message: `Product '${product}' does not exist.`,
                });
            }

            try {
                const expr = parser.parse(condition);
                expr.variables().forEach((v) => {
                    if (!(v in questionVars)) {
                        diagnostics.push({
                            from,
                            to: from + lines[line].length,
                            severity: 'error',
                            message: `Condition uses undefined variable '${v}'.`,
                        });
                    }
                });
            } catch (e) {
                diagnostics.push({
                    from,
                    to: from + lines[line].length,
                    severity: 'error',
                    message: `Invalid condition: ${e.message}`,
                });
            }

            if (typeof quantity === 'string') {
                try {
                    const expr = parser.parse(quantity);
                    expr.variables().forEach((v) => {
                        if (!(v in questionVars)) {
                            diagnostics.push({
                                from,
                                to: from + lines[line].length,
                                severity: 'error',
                                message: `Quantity uses undefined variable '${v}'.`,
                            });
                        }
                    });
                } catch (e) {
                    diagnostics.push({
                        from,
                        to: from + lines[line].length,
                        severity: 'error',
                        message: `Invalid quantity: ${e.message}`,
                    });
                }
            }
        });

        return diagnostics;
    };

    const yamlLinter = linter((view) => validateYamlInline(view.state.doc.toString()), { delay: 0 });

    return (
        <CodeMirror
            value={yamlText}
            theme={theme.palette.mode}
            maxHeight='500px'
            // height="400px"
            extensions={[yamlLang(), yamlLinter]}
            onChange={(value) => setYamlText(value)}
        />
    );
}
