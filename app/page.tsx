"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Calendar as CalendarIcon, User, Trash2, CheckCircle2, Edit, Download, Filter, MoreVertical, X } from "lucide-react"
import { format, isBefore, isThisWeek, parseISO, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  client: string
  dueDate: string
  priority: "Baixa" | "Média" | "Alta"
  completed: boolean
  createdAt: string
}

const priorityColors = {
  "Baixa": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Média": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Alta": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
}

export default function JuriFlow() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({ priority: "Média" })
  const [date, setDate] = useState<Date | undefined>(undefined)

  const [editingTask, setEditingTask] = useState<string | null>(null)

  // Filter states
  const [filterStatus, setFilterStatus] = useState<"Todas" | "Prazos vencidos" | "Esta semana">("Todas")
  const [filterClient, setFilterClient] = useState("")

  useEffect(() => {
    setIsMounted(true)
    const savedTasks = localStorage.getItem("juriflow-tasks")
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error("Failed to parse tasks", e)
      }
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("juriflow-tasks", JSON.stringify(tasks))
    }
  }, [tasks, isMounted])

  const handleAddTask = () => {
    if (!newTask.title?.trim() || !newTask.client?.trim() || !date) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      client: newTask.client.trim(),
      dueDate: date.toISOString(),
      priority: (newTask.priority as "Baixa" | "Média" | "Alta") || "Média",
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [task, ...prev])
    setNewTask({ priority: "Média" })
    setDate(undefined)
    setIsAddModalOpen(false)
    toast.success("Tarefa adicionada com sucesso!")
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => {
      if (task.id === id) {
        const newStatus = !task.completed;
        if (newStatus) toast.success(`Tarefa "${task.title}" marcada como concluída!`)
        return { ...task, completed: newStatus }
      }
      return task
    }))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    toast.info("Tarefa removida")
  }

  const exportToCSV = () => {
    const headers = ["ID,Título,Cliente,Data Vencimento,Prioridade,Status,Criado Em\n"]
    const csvContent = tasks.map(t => {
      const status = t.completed ? "Concluída" : "Pendente"
      return `${t.id},"${t.title}","${t.client}",${format(parseISO(t.dueDate), 'dd/MM/yyyy')},${t.priority},${status},${format(parseISO(t.createdAt), 'dd/MM/yyyy')}`
    }).join("\n")

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `juriflow_tarefas_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Tarefas exportadas com sucesso!")
  }

  const isOverdue = (dueDate: string) => {
    const today = startOfDay(new Date())
    const due = startOfDay(parseISO(dueDate))
    return isBefore(due, today)
  }

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (filterStatus === "Prazos vencidos") {
      filtered = filtered.filter(t => !t.completed && isOverdue(t.dueDate))
    } else if (filterStatus === "Esta semana") {
      filtered = filtered.filter(t => !t.completed && isThisWeek(parseISO(t.dueDate), { weekStartsOn: 0 }))
    }

    if (filterClient.trim() !== "") {
      filtered = filtered.filter(t => t.client.toLowerCase().includes(filterClient.toLowerCase()))
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
    })
  }, [tasks, filterStatus, filterClient])

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">J</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Juri<span className="text-primary">Flow</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex" disabled={tasks.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Tarefa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título da Tarefa</label>
                    <Input
                      placeholder="Ex: Revisar petição inicial"
                      value={newTask.title || ""}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente ou Processo</label>
                    <Input
                      placeholder="Ex: Silva & Associados"
                      value={newTask.client || ""}
                      onChange={(e) => setNewTask({ ...newTask, client: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Vencimento</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prioridade</label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(val: "Baixa" | "Média" | "Alta") => setNewTask({ ...newTask, priority: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddTask}>Salvar Tarefa</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 w-full max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">Painel de Tarefas</h2>
            <p className="text-muted-foreground">Você tem {tasks.filter(t => !t.completed).length} tarefas pendentes</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por cliente..."
                className="pl-9"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              />
              {filterClient && (
                <button onClick={() => setFilterClient("")} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Prazos vencidos">Prazos vencidos</SelectItem>
                <SelectItem value="Esta semana">Esta semana</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={exportToCSV} className="sm:hidden shrink-0" disabled={tasks.length === 0}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-dashed border-2 shadow-sm bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Você ainda não possui tarefas cadastradas. Comece a organizar sua rotina jurídica agora mesmo.
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? (
                <motion.div key="empty-filter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 text-muted-foreground">
                  Nenhuma tarefa corresponde aos filtros selecionados.
                </motion.div>
              ) : (
                filteredTasks.map((task) => {
                  const overdue = !task.completed && isOverdue(task.dueDate)

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className={cn(
                        "overflow-hidden transition-all duration-200 group hover:shadow-md",
                        task.completed ? "bg-muted/40 border-muted opacity-75" : "bg-card",
                        overdue && "border-destructive/50 shadow-sm shadow-destructive/10"
                      )}>
                        <CardContent className="p-0">
                          <div className="flex items-start sm:items-center p-4 sm:p-5 gap-4">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={cn(
                                "mt-1 sm:mt-0 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                task.completed
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 text-transparent hover:border-primary"
                              )}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                              <div className="flex-1 min-w-0">
                                <h3 className={cn("text-base font-medium truncate mb-1 transition-colors", task.completed && "line-through text-muted-foreground")}>
                                  {task.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1.5 truncate max-w-full">
                                    <User className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{task.client}</span>
                                  </span>
                                  <span className={cn("flex items-center gap-1.5", overdue && "text-destructive font-medium")}>
                                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                                    {format(parseISO(task.dueDate), "dd 'de' MMM", { locale: ptBR })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
                                {overdue && (
                                  <Badge variant="destructive" className="bg-destructive/90 hover:bg-destructive shadow-sm">
                                    Atrasado
                                  </Badge>
                                )}
                                <Badge variant="secondary" className={cn("font-medium", priorityColors[task.priority])}>
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto">
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteTask(task.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Desenvolvido por Samuel Monteiro Junior - LegalTech</p>
        </div>
      </footer>
    </div>
  )
}
