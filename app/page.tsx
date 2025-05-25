"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, User, Trash2, Check, CheckCircle2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  title: string
  client: string
  dueDate: string
  completed: boolean
  createdAt: string
}

export default function JuriFlow() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({
    title: "",
    client: "",
    dueDate: "",
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    client: "",
    dueDate: "",
  })

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("juriflow-tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("juriflow-tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.client.trim() || !newTask.dueDate) {
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      client: newTask.client.trim(),
      dueDate: newTask.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [...prev, task])
    setNewTask({ title: "", client: "", dueDate: "" })
    setShowAddForm(false)
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const startEdit = (task: Task) => {
    setEditingTask(task.id)
    setEditForm({
      title: task.title,
      client: task.client,
      dueDate: task.dueDate,
    })
  }

  const saveEdit = () => {
    if (!editForm.title.trim() || !editForm.client.trim() || !editForm.dueDate) {
      return
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask
          ? {
              ...task,
              title: editForm.title.trim(),
              client: editForm.client.trim(),
              dueDate: editForm.dueDate,
            }
          : task,
      ),
    )
    setEditingTask(null)
    setEditForm({ title: "", client: "", dueDate: "" })
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditForm({ title: "", client: "", dueDate: "" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00") // Adiciona horário para evitar problemas de timezone
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const isOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate + "T00:00:00") // Adiciona horário para evitar problemas de timezone
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    return due < today
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-[#003B5C] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-inter">JuriFlow</h1>
              <p className="text-[#00BFA6] mt-1">Organização jurídica inteligente</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-[#00BFA6] hover:bg-[#00A693] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Add Task Form */}
        {showAddForm && (
          <Card className="mb-8 border-[#00BFA6] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#1F2937] flex items-center">
                <Plus className="w-5 h-5 mr-2 text-[#00BFA6]" />
                Adicionar Nova Tarefa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Título da Tarefa</label>
                <Input
                  placeholder="Ex: Revisar contrato de locação"
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  className="border-gray-300 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Cliente</label>
                <Input
                  placeholder="Ex: João Silva"
                  value={newTask.client}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, client: e.target.value }))}
                  className="border-gray-300 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Data de Vencimento</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="border-gray-300 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={addTask} className="bg-[#00BFA6] hover:bg-[#00A693] text-white">
                  <Check className="w-4 h-4 mr-2" />
                  Adicionar Tarefa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-300 text-[#1F2937] hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#1F2937]">Suas Tarefas ({tasks.length})</h2>
            {tasks.length > 0 && (
              <div className="text-sm text-gray-600">{tasks.filter((t) => t.completed).length} concluídas</div>
            )}
          </div>

          {tasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-[#1F2937] mb-2">Nenhuma tarefa cadastrada</h3>
                <p className="text-gray-600 mb-4">Comece adicionando sua primeira tarefa jurídica</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-[#00BFA6] hover:bg-[#00A693] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Tarefa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sortedTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    task.completed
                      ? "bg-[#A3BE8C]/10 border-[#A3BE8C]/30"
                      : isOverdue(task.dueDate)
                        ? "border-red-200 bg-red-50/50"
                        : "border-gray-200 hover:border-[#00BFA6]/50"
                  }`}
                >
                  <CardContent className="p-6">
                    {editingTask === task.id ? (
                      // Edit Form
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1F2937] mb-2">Título da Tarefa</label>
                          <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="border-gray-300 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1F2937] mb-2">Cliente</label>
                          <Input
                            value={editForm.client}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, client: e.target.value }))}
                            className="border-gray-300 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1F2937] mb-2">Data de Vencimento</label>
                          <Input
                            type="date"
                            value={editForm.dueDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                            className="border-gray-300 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button onClick={saveEdit} className="bg-[#00BFA6] hover:bg-[#00A693] text-white">
                            <Check className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={cancelEdit}
                            className="border-gray-300 text-[#1F2937] hover:bg-gray-50"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Task Display
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTask(task.id)}
                              className={`p-1 h-8 w-8 rounded-full ${
                                task.completed
                                  ? "bg-[#A3BE8C] text-white hover:bg-[#8FA876]"
                                  : "border-2 border-gray-300 hover:border-[#00BFA6] hover:bg-[#00BFA6]/10"
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-4 h-4" />}
                            </Button>
                            <h3
                              className={`text-lg font-medium ${
                                task.completed ? "text-gray-500 line-through" : "text-[#1F2937]"
                              }`}
                            >
                              {task.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <User className="w-4 h-4 mr-1" />
                              {task.client}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(task.dueDate)}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            {task.completed && (
                              <Badge className="bg-[#A3BE8C] text-white hover:bg-[#8FA876]">Concluída</Badge>
                            )}
                            {!task.completed && isOverdue(task.dueDate) && (
                              <Badge variant="destructive">Atrasada</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          {!task.completed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(task)}
                              className="text-[#00BFA6] hover:text-[#00A693] hover:bg-[#00BFA6]/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#003B5C] text-white mt-auto">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm">JuriFlow - Desenvolvido em Elm com foco em excelência, clareza e impacto.</p>
          <p className="text-xs text-[#00BFA6] mt-1">Organização jurídica inteligente e moderna</p>
        </div>
      </footer>
    </div>
  )
}
