"use client";

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Plus,
  Edit,
  Trash2,
  Move,
  Search,
  RefreshCw,
  FolderPlus,
  Check,
  X,
  AlertCircle,
  Menu as MenuIcon,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface MenuNode {
  id: number;
  name: string;
  url: string;
  parentId: number | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  children?: MenuNode[];
}

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedMenu, setSelectedMenu] = useState<MenuNode | null>(null);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    parentId: null as number | null,
    position: 0,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const API_URL = API_BASE + '/api/menus';

    const fetchMenus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch menus from server');
        const data = await res.json();
        setMenus(data);
        // Auto expand root items initially
        const rootIds = new Set<number>(data.map((m: MenuNode) => m.id));
        setExpandedIds(rootIds);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchMenus();
  }, []);

  const toggleExpand = (id: number) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (nodes: MenuNode[]) => {
      nodes.forEach((n) => {
        allIds.add(n.id);
        if (n.children) collectIds(n.children);
      });
    };
    collectIds(menus);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleOpenCreate = (parentId: number | null = null) => {
    setModalMode('create');
    setFormData({
      name: '',
      url: '/',
      parentId: parentId,
      position: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu: MenuNode) => {
    setModalMode('edit');
    setSelectedMenu(menu);
    setFormData({
      name: menu.name,
      url: menu.url,
      parentId: menu.parentId,
      position: menu.position,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create menu');
      } else if (modalMode === 'edit' && selectedMenu) {
        const res = await fetch(`${API_URL}/${selectedMenu.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update menu');
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete menu');
      setDeleteConfirmId(null);
      if (selectedMenu?.id === id) setSelectedMenu(null);
      fetchMenus();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const collectDescendantIds = (nodes: MenuNode[]): number[] => {
    return nodes.flatMap((n) => [n.id, ...(n.children ? collectDescendantIds(n.children) : [])]);
  };

  const findNodeById = (nodes: MenuNode[], id: number): MenuNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNodeById(n.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleMove = async (draggedMenuId: number, targetParentId: number | null) => {
    if (draggedMenuId === targetParentId) return;

    const draggedNode = findNodeById(menus, draggedMenuId);
    if (draggedNode) {
      const descendantIds = collectDescendantIds(draggedNode.children || []);
      if (descendantIds.includes(targetParentId ?? -1)) {
        alert('Cannot move a menu item into its own descendant.');
        return;
      }
    }

    try {
      const res = await fetch(`${API_URL}/${draggedMenuId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: targetParentId }),
      });
      if (!res.ok) throw new Error('Failed to move menu');
      setDraggedId(null);
      fetchMenus();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter tree based on search query
  const filterTree = (nodes: MenuNode[], query: string): MenuNode[] => {
    if (!query) return nodes;
    return nodes.reduce((acc: MenuNode[], node) => {
      const matches = node.name.toLowerCase().includes(query.toLowerCase()) ||
                      node.url.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = node.children ? filterTree(node.children, query) : [];
      if (matches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
      }
      return acc;
    }, []);
  };

  const displayedMenus = filterTree(menus, searchQuery);

  const renderTreeNodes = (nodes: MenuNode[], level = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedIds.has(node.id);
      const isSelected = selectedMenu?.id === node.id;

      return (
        <div
          key={node.id}
          className="select-none"
          draggable
          onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', String(node.id)); setDraggedId(node.id); }}
                    onDragOver={(e) => { e.stopPropagation(); e.preventDefault(); }}
                    onDrop={(e) => { e.stopPropagation(); e.preventDefault(); handleMove(Number(e.dataTransfer.getData('text/plain')), node.id); }}
          onDragEnd={() => setDraggedId(null)}
        >
          <div
            className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-move transition-colors ${
              isSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
            style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
            onClick={() => setSelectedMenu(node)}
          >
            <div className="flex items-center space-x-2 truncate">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.id);
                  }}
                  className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              {hasChildren ? <Folder size={16} className="text-blue-400 shrink-0" /> : <FileText size={16} className="text-slate-400 shrink-0" />}
              <span className="text-sm font-medium truncate">{node.name}</span>
              <span className="text-xs opacity-60 truncate">({node.url})</span>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                title="Add Child Menu"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCreate(node.id);
                }}
                className="p-1 rounded hover:bg-blue-500 hover:text-white"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                title="Edit Menu"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(node);
                }}
                className="p-1 rounded hover:bg-blue-500 hover:text-white"
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                title="Delete Menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(node.id);
                }}
                className="p-1 rounded hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div>{renderTreeNodes(node.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      {/* 1. Sidebar Biru (Figma inspired) */}
      <aside className={(sidebarOpen ? 'flex fixed inset-y-0 left-0 z-50 ' : 'hidden ') + 'md:flex w-64 bg-blue-700 text-white flex-col shrink-0 shadow-lg'}>
        <div className="p-4 border-b border-blue-600 flex items-center space-x-3">
          <Layers className="h-6 w-6 text-blue-200" />
          <span className="font-bold text-lg tracking-wide">STK Menu Manager</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-800 text-white font-medium">
            <MenuIcon size={18} />
            <span>Menu Builder</span>
          </a>
          <a href={API_BASE + '/api'} target="_blank" rel="noreferrer" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-blue-600 text-blue-100 transition-colors">
            <FileText size={18} />
            <span>Swagger Docs</span>
          </a>
        </nav>
        <div className="p-4 border-t border-blue-600 text-xs text-blue-200 text-center">
          STK Technical Test v1.0
        </div>
      </aside>
 {sidebarOpen && (
 <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
 )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="min-h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
 <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300" aria-label="Open menu">
 <MenuIcon size={20} />
 </button>
          <div className="flex items-center space-x-2 flex-1 min-w-[180px] md:max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search menus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              Collapse All
            </button>
            <button
              onClick={fetchMenus}
              title="Refresh"
              className="p-2 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => handleOpenCreate(null)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition-colors"
            >
              <Plus size={16} />
              <span>Add Root Menu</span>
            </button>
          </div>
        </header>

        {/* Workspace: Left Tree & Right Detail Form */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* 2. Tree Kiri */}
          <section className="w-full md:w-1/3 h-[45%] md:h-auto bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span>Menu Hierarchy</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {menus.length} items
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loading && menus.length === 0 ? (
                <div className="flex justify-center items-center h-32 text-slate-400 text-sm">Loading menus...</div>
              ) : error ? (
                <div className="p-4 text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg text-sm flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : displayedMenus.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No menus found</div>
              ) : (
                renderTreeNodes(displayedMenus)
              )}
            </div>
          </section>

          {/* 3. Form Detail Kanan */}
          <section className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>Menu Details</span>
                {selectedMenu && (
                  <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                    ID: {selectedMenu.id}
                  </span>
                )}
              </h2>

              {selectedMenu ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                      {selectedMenu.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">URL / Route</label>
                    <div className="text-sm font-mono text-blue-600 dark:text-blue-400 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                      {selectedMenu.url}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Parent ID</label>
                      <div className="text-sm text-slate-800 dark:text-slate-200 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        {selectedMenu.parentId !== null ? selectedMenu.parentId : 'Root (None)'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Position</label>
                      <div className="text-sm text-slate-800 dark:text-slate-200 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        {selectedMenu.position}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex space-x-3">
                    <button
                      onClick={() => handleOpenEdit(selectedMenu)}
                      className="flex-1 bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Edit size={16} />
                      <span>Edit Menu</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(selectedMenu.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <MenuIcon className="mx-auto h-12 w-12 opacity-30 mb-3" />
                  <p className="text-sm">Select a menu item on the left to view details or perform actions.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {modalMode === 'create' ? 'Create Menu Item' : 'Edit Menu Item'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Menu Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  placeholder="e.g. Analytics"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">URL</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  placeholder="https://example.com or /path"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Parent ID</label>
                  <input
                    type="number"
                    value={formData.parentId !== null ? formData.parentId : ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value, 10) : null })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    placeholder="Null for root"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Position</label>
                  <input
                    type="number"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow"
                >
                  Save Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Menu Item?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This action will permanently delete this menu item and all its nested sub-children.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
