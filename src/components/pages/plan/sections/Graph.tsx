import {useCallback, useEffect, useMemo} from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type {ExplainDiagnostic, ExplainMetrics, ExplainPlan} from '@tabularis/explain';
import {explainPlanToFlow} from '@tabularis/explain/flow';
import {PlanNode} from './PlanNode';

const nodeTypes = {explainPlan: PlanNode};

interface GraphProps {
    plan: ExplainPlan;
    metrics: ExplainMetrics;
    diagnostics: Map<string, ExplainDiagnostic[]>;
    selectedNodeId: string | null;
    onSelectNode: (nodeId: string) => void;
}

function GraphInner({plan, metrics, diagnostics, selectedNodeId, onSelectNode}: GraphProps) {
    const {fitView} = useReactFlow();

    const flow = useMemo(
        () => explainPlanToFlow(plan, selectedNodeId, metrics, diagnostics),
        [plan, selectedNodeId, metrics, diagnostics],
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);

    useEffect(() => {
        setNodes(flow.nodes);
        setEdges(flow.edges);
    }, [flow, setNodes, setEdges]);

    const handleInit = useCallback(() => {
        setTimeout(() => fitView({padding: 0.2}), 50);
    }, [fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onInit={handleInit}
            onNodeClick={(_, node) => onSelectNode(node.id)}
            colorMode="dark"
            fitView
            minZoom={0.1}
            maxZoom={2}
            proOptions={{hideAttribution: true}}
        >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
            <Controls showInteractive={false} />
            {nodes.length > 10 && <MiniMap nodeStrokeWidth={3} pannable zoomable />}
        </ReactFlow>
    );
}

export function Graph(props: GraphProps) {
    return (
        <div className="w-full h-full">
            <ReactFlowProvider>
                <GraphInner {...props} />
            </ReactFlowProvider>
        </div>
    );
}
