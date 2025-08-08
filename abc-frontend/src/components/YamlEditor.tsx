import CodeMirror from '@uiw/react-codemirror';
import { yaml as yamlLang } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import { linter, Diagnostic } from '@codemirror/lint';
import yaml from 'js-yaml';
import { Parser } from 'expr-eval';
import { Box, useTheme } from '@mui/material';
import { PatternType } from '../pages/pe/EditPattern';

interface YamlEditorProps {
    pattern: PatternType;
    onChange: (script: string) => void;
}

export default function YamlEditor({ pattern, onChange }: YamlEditorProps) {
    const theme = useTheme();
    const validateYamlInline = (text: string): Diagnostic[] => {
        const diagnostics: Diagnostic[] = [];
        const lines = text.split('\n');
        const parser = new Parser();
        const questionVars: Record<string, any> = {};

        const getOffset = (line: number): number =>
            line >= 0 ? lines.slice(0, line).reduce((acc, l) => acc + l.length + 1, 0) : 0;

        let parsed: any;
        try {
            parsed = yaml.load(text);
        } catch (e: any) {
            diagnostics.push({
                from: 0,
                to: text.length,
                severity: 'error',
                message: `YAML Syntax Error: ${e.message}`,
            });
            return diagnostics;
        }

        const questions = parsed?.questions ?? [];
        const rules = parsed?.rules ?? [];

        // Validate questions
        questions.forEach((q: any) => {
            const { name, type, default: def, choices } = q;
            const lineIndex = lines.findIndex(l => l.includes(`name: ${name}`));
            const from = getOffset(lineIndex);
            const to = lineIndex >= 0 ? from + lines[lineIndex].length : from + 1;

            questionVars[name] = def;

            if (type === 'boolean' && choices) {
                diagnostics.push({
                    from,
                    to,
                    severity: 'error',
                    message: `Boolean question '${name}' should not have choices.`,
                });
            }

            if (type === 'enum') {
                if (!Array.isArray(choices) || !choices.includes(def)) {
                    diagnostics.push({
                        from,
                        to,
                        severity: 'error',
                        message: `Enum question '${name}' must have valid choices and a default in that list.`,
                    });
                }
            }
        });

        // Validate rules
        rules.forEach((rule: any) => {
            const { condition, add } = rule;
            const product = add?.product;
            const quantity = add?.quantity;
            const lineIndex = product
                ? lines.findIndex(l => l.includes(product))
                : lines.findIndex(l => l.includes(condition));
            const from = getOffset(lineIndex);
            const to = lineIndex >= 0 ? from + lines[lineIndex].length : from + 1;
            // Validate quantity expression (if string)
            if (typeof quantity === 'string') {
                try {
                    const expr = parser.parse(quantity);
                    expr.variables().forEach(v => {
                        if (!(v in questionVars)) {
                            diagnostics.push({
                                from,
                                to,
                                severity: 'error',
                                message: `Quantity uses undefined variable '${v}'.`,
                            });
                        }
                    });
                } catch (e: any) {
                    diagnostics.push({
                        from,
                        to,
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
        <Box sx={{ flex: 1, maxWidth: '50%' }}>
            <CodeMirror
                placeholder={`This pattern template is empty!\nYou may find it useful to create a new pattern to get a template.`}
                value={pattern.yaml}
                theme={theme.palette.mode}
                onError={console.error}
                extensions={[yamlLang(), yamlLinter, EditorView.lineWrapping]}
                onChange={onChange}
            />
        </Box>
    );
}

interface YamlDemoProps {
    yaml: string,
}

export function YamlDemo({ yaml }: YamlDemoProps) {
    const theme = useTheme();
    return (
        <CodeMirror
            editable={false}
            value={yaml}
            theme={theme.palette.mode}
            extensions={[yamlLang(), EditorView.lineWrapping]}
        />
    );
}