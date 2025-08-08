import { useEffect, useState } from "react";
import { useAPI } from "../../components/APIProvider";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, CircularProgress, FormControlLabel, FormLabel, TextField, Typography, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import YamlEditor, { YamlDemo } from "../../components/YamlEditor";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageTitle from "../../components/PageTitle";
import { Hardware, Save } from "@mui/icons-material";
import { useLoading } from "../../components/LoadingContext";
import { PatternGroupType } from "./Pattern";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type QuestionType = 'integer' | 'boolean' | 'enum';

export interface ProcessedQuestion {
    name: string;
    description?: string,
    type: QuestionType;
    prompt: string;
    default: number | boolean | string;
    choices?: (string | number)[];
    min?: number;
    max?: number;
}

export interface PatternType {
    id: number;
    version: number;
    deprecated: boolean;
    description: string;
    pattern_group: PatternGroupType;
    questions: ProcessedQuestion[];
    yaml: string;
}

function PatternPage() {
    const api = useAPI();
    const { patternId } = useParams();
    const [pattern, setPattern] = useState<PatternType>();

    useEffect(() => {
        api.get<PatternType>(`/api/pattern/${patternId}`)
            .then((res) => res.data)
            .then(setPattern)
            .catch(console.error);
    }, [patternId]);

    return pattern ? <InnerContent pattern={pattern} /> : <Box sx={{ my: 4, justifySelf: 'center' }}><CircularProgress /></Box>
}

interface ContentType {
    pattern: PatternType;
}

// To ensure pattern is defined
const InnerContent: React.FC<ContentType> = ({ pattern: initPattern }) => {
    const api = useAPI();
    const theme = useTheme();
    const { loading } = useLoading();
    const navigation = useNavigate();
    // Can't compare with old / new patterns so this will have to do
    const [pattern, setPattern] = useState<PatternType>(initPattern);
    const [deprecated, setDeprecated] = useState<boolean>(pattern.deprecated);
    const [description, setDescription] = useState<string>(pattern.description);
    const [yaml, setYaml] = useState<string>(pattern.yaml);

    const savePattern = () => {
        api.patch<PatternType>(`/api/pattern/${pattern.id}`, { deprecated, description, yaml }).then((res) => setPattern(res.data)).catch(console.error);
    };

    return (
        <Box style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <title>Edit Pattern</title>
            <Box sx={{ flex: 1 }}>
                <Box sx={{ px: 10, pt: 3, position: 'sticky', top: 80, zIndex: 1000 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigation("/pe/pattern", { viewTransition: true })}
                            >
                                Back
                            </Button>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <PageTitle title={`${pattern.pattern_group.name}`} />
                            <p>Version #{pattern.version}</p>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Hardware />}
                                onClick={() => navigation(`/build/${pattern.id}`, { viewTransition: true })}
                            >
                                To Build Page
                            </Button>
                        </Box>
                    </Box>
                    {/* Make the save button stick to the top in case they scroll */}
                    <Box>
                        <Button fullWidth variant="contained" startIcon={<Save />} color="primary" disabled={loading || (pattern.deprecated == deprecated && pattern.description == description && pattern.yaml == yaml)} onClick={savePattern}>
                            Save
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
                        <TextField fullWidth value={description} onChange={(e) => setDescription(e.target.value)} label="Version Description" placeholder="What's new in this version?" variant="standard" />
                        <Box>
                            <FormLabel component="legend">Deprecated versions aren't shown to product leads.</FormLabel>
                            <FormControlLabel control={<Checkbox defaultChecked={deprecated} value={deprecated} onChange={(e) => setDeprecated(e.target.checked)} />} label="Deprecated" />
                        </Box>
                    </Box>
                    <h2>YAML</h2>
                    <p>The YAML file on the right side of the screen defines how the BOM is built. Click <b>save</b> to ensure your changes are kept. If there's a problem, a notification appears and your changes will <b>not</b> be saved until all issues are resolved.</p>
                    {/* Meat of ABC */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="bold">Questions</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <p><em>See the products section for how to integrate questions answers into the BOM.</em></p>
                            <p>You can define questions to ask the PLs to fill out. The answers to those questions are used as inputs for calculating quantities of BOM items in the <code>products</code> section. Questions are <b>optional</b> — you can omit the entire questions array if unneeded. Here's an example:</p>
                            <YamlDemo
                                yaml={`questions:
- name: num_racks
  type: integer
  min: 0
  max: 2
  prompt: "How many racks?"
  # Descriptions are optional. They'll appear below the question (prompt) on the build BOM page
  description: "How many racks does your network require?"
  default: 2

- name: power_cables
  type: boolean
  prompt: "Do you need power cables?"
  default: false

- name: support_years
  type: enum
  prompt: "How many years of support?"
  choices: [1, 3, 5]
  default: 3`}
                            />
                            <h4>Types</h4>
                            <p>There are 3 different types of questions you can define: <code>integer</code>, <code>boolean</code>, and <code>enum</code>. Integer questions can have <code>min</code> and/or <code>max</code> attached, otherwise the range is infinite.</p>
                            <p>Enum questions define a set of choices. They <b>must</b> have a <code>choices</code> array attached:</p>
                            <YamlDemo
                                yaml={`# These define integer choices
choices: [1, 3, 5]
default: 3
# ... while these define strings
choices: ["Option 1", "Option 2", "Option 3"]
default: "Option 1"
# ADVANCED: they can also vary (although usually inapplicable)
choices: ["Option 1", 7, 3.4]
default: 7`}
                            />
                            <p>Note that the typing matters for each entry in the choices array, and may impact how the question's variable is interpreted in the products section when used in python expressions.</p>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="bold">Products</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <p>This is where you'll define what actually goes into the BOM. Each entry represents one row in the BOM. Here's an example:</p>
                            <YamlDemo yaml={`products:
- add:
    product: "my-products-part-number"
    quantity: 2
- add:
    product: "my-other-products-part-number"
    quantity: 4
# ... etc. Add as many as you need`} />
                            <p><code>product</code> and <code>quantity</code> are both required fields. The value for <code>product</code> must match a product's <b>Manufacturer Part Number</b> in the database. To add a product, navigate to the <a href="/pe/product" target="_blank">products page</a>.</p>
                            <h4>Using questions</h4>
                            <p>If you ask any questions, you can use their answers to set product quantities or fill conditions using <b>Python expressions</b>:</p>
                            <YamlDemo yaml={`questions:
# 'power_cables' becomes a variable for expressions in products
- name: needs_cables
  type: boolean
  prompt: "Do you need power cables?"
  default: false
# ... same with 'num_cables'
- name: num_cables
  type: integer
  min: 0
  max: 2
  prompt: "How many power cables?"
  default: 2

products:
  # Conditions are optional!
- condition: "needs_cables == True"
  add:
    product: "my-power-cable-part-number"
    # Doubles the requested number of cables
    quantity: "num_cables * 2"`} />
                            <p>In this example, the power cable BOM item will only be added if the user answered <b>yes</b> (true) to the "Do you need power cables?" question. And if added, it will double the amount that they requested.</p>
                            <h4>Conditions</h4>
                            <p><code>condition</code> is optional. It determines if the BOM should include or omit the row for that product. If <code>condition</code> isn't set, the BOM item is always added (even if the quantity is 0).</p>
                            <p>In the previous example, if you wanted to include the <code>my-power-cable-part-number</code> row even if it's 0, you could remove <code>condition</code> and set <code>quantity</code> to <code>"0 if not needs_cables else num_cables * 2"</code>.</p>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="bold">Force adding rows</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <p>If you want to add rows to the BOM that aren't necessarily products, you can manually add rows yourself:</p>
                            <YamlDemo yaml={`products:
- add:
    # Columns:
    # Manufacturer Part #, Manufacturer, Description, Device Role, Qty, List Price, Discount, Customer Price, Ext. Price
    raw: ["my-part-number", "Cisco", "This device doesn't exist in the DB for some reason", "", 1, "$0", "100%", "$0", "$0"]`} />
                            <p>Each item in the array represents one cell in the row, ordered left to right. Each cell is added raw (no formatting / processing is done).</p>
                            <p>The main use case of this feature would be if you want to add a specific product that costs nothing but needs to be added to the BOM anyways (or it's not worth adding to the products database).</p>
                            <p>Keep in mind, this is a dirty ad hoc solution as adding products to the database is preferred.</p>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
            <YamlEditor pattern={pattern} onChange={setYaml} />
        </Box>
    )
}

export default PatternPage;
