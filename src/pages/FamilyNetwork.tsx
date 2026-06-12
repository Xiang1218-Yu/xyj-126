import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, Users, Search, Info, Trash2 } from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { RELATION_LABELS, type FamilyRelation, type Memorial } from "@/types";
import { formatDateShort } from "@/utils";

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  memorial: Memorial;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  relation: FamilyRelation;
}

export default function FamilyNetwork() {
  const { memorials, familyRelations, loadMemorials, loadFamilyRelations, removeFamilyRelation } = useMemorialStore();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scale, setScale] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Map<string, Node>>(new Map());
  const edgesRef = useRef<Edge[]>([]);
  const animationRef = useRef<number>();
  const [, forceUpdate] = useState(0);
  const isDraggingRef = useRef<string | null>(null);

  useEffect(() => {
    loadMemorials();
    loadFamilyRelations();
  }, [loadMemorials, loadFamilyRelations]);

  const initNodes = useCallback(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const publicMemorials = memorials.filter((m) => !m.isPrivate);

    publicMemorials.forEach((memorial, i) => {
      const angle = (2 * Math.PI * i) / Math.max(publicMemorials.length, 1);
      const radius = 150 + Math.min(publicMemorials.length * 10, 100);
      nodesRef.current.set(memorial.id, {
        id: memorial.id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
        memorial,
      });
    });

    edgesRef.current = familyRelations
      .filter(
        (r) =>
          nodesRef.current.has(r.fromMemorialId) && nodesRef.current.has(r.toMemorialId)
      )
      .map((r) => ({
        id: r.id,
        source: r.fromMemorialId,
        target: r.toMemorialId,
        relation: r,
      }));
  }, [memorials, familyRelations]);

  useEffect(() => {
    initNodes();
  }, [initNodes]);

  useEffect(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    function simulate() {
      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 600;
      const centerX = width / 2;
      const centerY = height / 2;

      nodes.forEach((node) => {
        if (isDraggingRef.current === node.id) return;

        let fx = (centerX - node.x) * 0.001;
        let fy = (centerY - node.y) * 0.001;

        nodes.forEach((other) => {
          if (other.id === node.id) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 2000 / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        edges.forEach((edge) => {
          let source: Node | undefined;
          let target: Node | undefined;

          if (edge.source === node.id) {
            source = node;
            target = nodes.get(edge.target);
          } else if (edge.target === node.id) {
            source = nodes.get(edge.source);
            target = node;
          } else {
            return;
          }

          if (!source || !target) return;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 180;
          const force = (dist - targetDist) * 0.01;

          if (node.id === source.id) {
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          } else {
            fx -= (dx / dist) * force;
            fy -= (dy / dist) * force;
          }
        });

        node.vx += fx;
        node.vy += fy;
        node.vx *= 0.85;
        node.vy *= 0.85;
        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(60, Math.min(width - 60, node.x));
        node.y = Math.max(60, Math.min(height - 60, node.y));
      });

      forceUpdate((n) => n + 1);
      animationRef.current = requestAnimationFrame(simulate);
    }

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [memorials.length, familyRelations.length]);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    isDraggingRef.current = nodeId;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const node = nodesRef.current.get(isDraggingRef.current);
    if (node) {
      node.x = x;
      node.y = y;
      node.vx = 0;
      node.vy = 0;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = null;
  };

  const handleNodeClick = (node: Node) => {
    if (Math.abs(node.vx) < 0.5 && Math.abs(node.vy) < 0.5) {
      setSelectedNode(selectedNode?.id === node.id ? null : node);
    }
  };

  const filteredMemorials = searchQuery
    ? memorials.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.isPrivate
      )
    : memorials.filter((m) => !m.isPrivate);

  const nodes = Array.from(nodesRef.current.values()).filter((n) =>
    filteredMemorials.some((m) => m.id === n.id)
  );
  const edges = edgesRef.current.filter(
    (e) =>
      filteredMemorials.some((m) => m.id === e.source) &&
      filteredMemorials.some((m) => m.id === e.target)
  );

  const getRelationColor = (relation: string) => {
    const colors: Record<string, string> = {
      spouse: "#d88730",
      father: "#55644a",
      mother: "#8c6233",
      son: "#6f7e61",
      daughter: "#a87d3c",
      brother: "#434f3b",
      sister: "#735030",
      grandfather: "#2f372a",
      grandmother: "#5f432a",
      grandson: "#8f9c82",
      granddaughter: "#c9a962",
      uncle: "#384131",
      aunt: "#744520",
      nephew: "#55644a",
      niece: "#a87d3c",
      cousin: "#b5beab",
      other: "#b5beab",
    };
    return colors[relation] || "#b5beab";
  };

  const getEdgePath = (edge: Edge) => {
    const source = nodesRef.current.get(edge.source);
    const target = nodesRef.current.get(edge.target);
    if (!source || !target) return "";

    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2 - 20;

    return `M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`;
  };

  const getLabelPosition = (edge: Edge) => {
    const source = nodesRef.current.get(edge.source);
    const target = nodesRef.current.get(edge.target);
    if (!source || !target) return { x: 0, y: 0 };

    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2 - 25;

    return { x: midX, y: midY };
  };

  const handleDeleteRelation = (relationId: string) => {
    removeFamilyRelation(relationId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-memorial-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-memorial-700" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-memorial-950 font-medium">
                亲属关系网络
              </h1>
              <p className="text-memorial-500 text-sm">
                可视化管理家族亲属关系
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-memorial-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-memorial-600" />
                    <span className="font-medium text-memorial-700">
                      {filteredMemorials.length} 位亲属
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                      className="p-2 rounded-lg hover:bg-memorial-50 transition-colors"
                    >
                      <ZoomOut className="w-4 h-4 text-memorial-600" />
                    </button>
                    <span className="text-sm text-memorial-500 w-16 text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale((s) => Math.min(2, s + 0.1))}
                      className="p-2 rounded-lg hover:bg-memorial-50 transition-colors"
                    >
                      <ZoomIn className="w-4 h-4 text-memorial-600" />
                    </button>
                    <button
                      onClick={() => {
                        setScale(1);
                        initNodes();
                      }}
                      className="p-2 rounded-lg hover:bg-memorial-50 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4 text-memorial-600" />
                    </button>
                  </div>
                </div>

                <div
                  ref={containerRef}
                  className="relative bg-gradient-to-br from-cream-50 to-memorial-50 overflow-hidden"
                  style={{ height: "600px" }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <svg
                    ref={svgRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                  >
                    <defs>
                      <radialGradient id="nodeGradient" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#e8ebe4" />
                      </radialGradient>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                      </filter>
                    </defs>

                    <g>
                      {edges.map((edge) => (
                        <g key={edge.id}>
                          <path
                            d={getEdgePath(edge)}
                            fill="none"
                            stroke={getRelationColor(edge.relation.relation)}
                            strokeWidth="2"
                            strokeOpacity="0.6"
                            strokeDasharray="none"
                            className="transition-all duration-300"
                          />
                          <g
                            transform={`translate(${getLabelPosition(edge).x}, ${getLabelPosition(edge).y})`}
                            onMouseEnter={() => setHoveredNode(edge.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                          >
                            <rect
                              x="-45"
                              y="-12"
                              width="90"
                              height="24"
                              rx="12"
                              fill="white"
                              stroke={getRelationColor(edge.relation.relation)}
                              strokeWidth="1"
                              className="transition-all duration-200"
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-xs fill-memorial-700"
                            >
                              {RELATION_LABELS[edge.relation.relation]}
                            </text>
                          </g>
                        </g>
                      ))}
                    </g>

                    <g>
                      {nodes.map((node) => (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          onMouseDown={(e) => handleMouseDown(e, node.id)}
                          onClick={() => handleNodeClick(node)}
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                          className="cursor-pointer"
                        >
                          <circle
                            r="48"
                            fill="url(#nodeGradient)"
                            stroke={selectedNode?.id === node.id ? "#55644a" : hoveredNode === node.id ? "#8f9c82" : "#d4d9cd"}
                            strokeWidth={selectedNode?.id === node.id ? "3" : "2"}
                            filter="url(#shadow)"
                            className="transition-all duration-200"
                          />
                          {node.memorial.avatar ? (
                            <clipPath id={`clip-${node.id}`}>
                              <circle r="42" />
                            </clipPath>
                          ) : null}
                          {node.memorial.avatar ? (
                            <image
                              href={node.memorial.avatar}
                              x="-42"
                              y="-42"
                              width="84"
                              height="84"
                              clipPath={`url(#clip-${node.id})`}
                              preserveAspectRatio="xMidYMid slice"
                            />
                          ) : (
                            <text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-2xl font-serif fill-memorial-700"
                            >
                              {node.memorial.name.charAt(0)}
                            </text>
                          )}
                          <text
                            y="65"
                            textAnchor="middle"
                            className="text-sm font-medium fill-memorial-800"
                          >
                            {node.memorial.name}
                          </text>
                          <text
                            y="82"
                            textAnchor="middle"
                            className="text-xs fill-memorial-500"
                          >
                            {formatDateShort(node.memorial.birthDate)} - {formatDateShort(node.memorial.deathDate)}
                          </text>
                        </g>
                      ))}
                    </g>
                  </svg>

                  {filteredMemorials.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Users className="w-16 h-16 text-memorial-300 mx-auto mb-4" />
                        <p className="text-memorial-500">
                          {searchQuery ? "没有找到匹配的亲属" : "暂无公开的亲属关系数据"}
                        </p>
                        <p className="text-memorial-400 text-sm mt-1">
                          {searchQuery ? "试试其他关键词" : "在纪念页编辑页面添加亲属关系"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-memorial-100">
                  <div className="flex items-center gap-2 text-sm text-memorial-500">
                    <Info className="w-4 h-4" />
                    <span>拖拽节点调整位置，点击节点查看详情</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-serif text-lg text-memorial-950 mb-4">筛选</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-memorial-400" />
                  <input
                    type="text"
                    placeholder="搜索亲属姓名..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-memorial-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all text-sm"
                  />
                </div>
              </div>

              {selectedNode && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-serif text-lg text-memorial-950 mb-4">
                    {selectedNode.memorial.name}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-memorial-600">
                      {formatDateShort(selectedNode.memorial.birthDate)} — {formatDateShort(selectedNode.memorial.deathDate)}
                    </p>
                    {selectedNode.memorial.epitaph && (
                      <p className="text-sm text-memorial-700 italic font-serif">
                        "{selectedNode.memorial.epitaph}"
                      </p>
                    )}
                    <div className="pt-3 border-t border-memorial-100">
                      <h4 className="text-sm font-medium text-memorial-700 mb-2">亲属关系</h4>
                      <div className="space-y-2">
                        {familyRelations
                          .filter(
                            (r) =>
                              r.fromMemorialId === selectedNode.id ||
                              r.toMemorialId === selectedNode.id
                          )
                          .map((r) => {
                            const otherId = r.fromMemorialId === selectedNode.id ? r.toMemorialId : r.fromMemorialId;
                            const other = memorials.find((m) => m.id === otherId);
                            if (!other || other.isPrivate) return null;
                            const label = r.fromMemorialId === selectedNode.id
                              ? RELATION_LABELS[r.relation]
                              : `（${RELATION_LABELS[r.relation]}的对方）`;
                            return (
                              <div
                                key={r.id}
                                className="flex items-center justify-between text-sm bg-memorial-50 rounded-lg p-2"
                              >
                                <div>
                                  <Link
                                    to={`/memorial/${other.id}`}
                                    className="text-memorial-800 hover:text-memorial-600"
                                  >
                                    {other.name}
                                  </Link>
                                  <span className="text-memorial-500 ml-2">{label}</span>
                                </div>
                                <button
                                  onClick={() => setShowDeleteConfirm(showDeleteConfirm === r.id ? null : r.id)}
                                  className="p-1 rounded hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-memorial-400 hover:text-red-500" />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Link
                        to={`/memorial/${selectedNode.id}`}
                        className="flex-1 py-2 text-center bg-memorial-950 text-cream-100 rounded-lg hover:bg-memorial-800 transition-colors text-sm font-medium"
                      >
                        查看纪念页
                      </Link>
                      <Link
                        to={`/edit/${selectedNode.id}`}
                        className="flex-1 py-2 text-center border border-memorial-300 text-memorial-700 rounded-lg hover:bg-memorial-50 transition-colors text-sm font-medium"
                      >
                        编辑关系
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-serif text-lg text-memorial-950 mb-4">关系图例</h3>
                <div className="space-y-2">
                  {Object.entries(RELATION_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-8 h-1 rounded"
                        style={{ backgroundColor: getRelationColor(key) }}
                      />
                      <span className="text-memorial-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-serif text-lg text-memorial-950 mb-4">亲属列表</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredMemorials.map((m) => (
                    <Link
                      key={m.id}
                      to={`/memorial/${m.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-memorial-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-memorial-100 flex items-center justify-center text-memorial-600 font-serif">
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-memorial-800 truncate">
                          {m.name}
                        </p>
                        <p className="text-xs text-memorial-500">
                          {formatDateShort(m.birthDate)} - {formatDateShort(m.deathDate)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-lg text-memorial-950 mb-2">确认删除</h3>
            <p className="text-memorial-600 text-sm mb-6">
              确定要删除这条亲属关系吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-memorial-300 text-memorial-700 rounded-xl hover:bg-memorial-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteRelation(showDeleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
