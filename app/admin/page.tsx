import { Activity, Users, FileText, AlertTriangle, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Real-time Overview</h2>
                    <p className="text-muted-foreground">
                        Live monitoring of intern assessment session <span className="text-primary font-mono">#429</span>
                    </p>
                </div>
                <div className="flex items-center space-x-2 bg-black/20 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                    <span className="flex items-center text-sm font-medium text-emerald-400">
                        <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
                        SYSTEM ONLINE
                    </span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-l-4 border-l-cyan-500 hover:scale-105 transition-transform duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Interns</CardTitle>
                        <Users className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">142</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-emerald-400 flex items-center mr-1"><ArrowUpRight className="h-3 w-3" /> +12%</span> from last hour
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-blue-500 hover:scale-105 transition-transform duration-300 delay-100 animate-slide-up">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
                        <Activity className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">84%</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-emerald-400 flex items-center mr-1"><ArrowUpRight className="h-3 w-3" /> +2.4%</span> improvement
                        </p>
                        <Progress value={84} className="mt-3 h-1 bg-blue-900/50" />
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-sky-500 hover:scale-105 transition-transform duration-300 delay-200 animate-slide-up">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Submission Velocity</CardTitle>
                        <FileText className="h-4 w-4 text-sky-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">18<span className="text-sm font-normal text-muted-foreground ml-1">/min</span></div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Peak load expected in 10m
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-red-500 hover:scale-105 transition-transform duration-300 delay-300 animate-slide-up">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Incidents</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">3</div>
                        <p className="text-xs text-red-400 mt-1 font-semibold flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Critical Attention Needed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 delay-200 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
                <Card className="col-span-4 glass-card">
                    <CardHeader>
                        <CardTitle>Assessment Velocity</CardTitle>
                        <CardDescription>
                            Submission rates over the last 24 hours
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-end justify-between gap-1 px-4 pt-4">
                            {[35, 45, 30, 60, 75, 50, 65, 80, 70, 45, 55, 60, 40, 30, 50, 70, 85, 90, 60, 50, 40, 30, 20, 10].map((h, i) => (
                                <div
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className="w-full bg-cyan-500/20 hover:bg-cyan-400 transition-all duration-300 rounded-t-sm cursor-pointer hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-4 mt-2 font-mono">
                            <span>10:00</span>
                            <span>12:00</span>
                            <span>14:00</span>
                            <span>16:00</span>
                            <span>18:00</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 glass-card">
                    <CardHeader>
                        <CardTitle>Skill Distribution</CardTitle>
                        <CardDescription>
                            Cohort performance by category
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-300">Algorithms (Python)</span>
                                <span className="font-bold text-cyan-400">92%</span>
                            </div>
                            <Progress value={92} className="h-1.5 bg-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-300">Database (SQL)</span>
                                <span className="font-bold text-orange-400">65%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-300">Frontend (React)</span>
                                <span className="font-bold text-blue-400">45%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-300">Backend (Node)</span>
                                <span className="font-bold text-purple-400">78%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[78%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card animate-slide-up delay-300" style={{ animationFillMode: 'backwards' }}>
                <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>
                        Candidates with highest completion rates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="text-zinc-400">Candidate</TableHead>
                                <TableHead className="text-zinc-400">Assessment</TableHead>
                                <TableHead className="text-zinc-400">Score</TableHead>
                                <TableHead className="text-zinc-400">Time</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-white/5 border-white/5 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg" />
                                        <div>
                                            <div className="font-bold text-white">Sarah Jenkins</div>
                                            <div className="text-xs text-muted-foreground">ID: #8821</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-300">Full Stack Certification</TableCell>
                                <TableCell className="font-bold text-cyan-400">98/100</TableCell>
                                <TableCell className="font-mono text-zinc-400">45m 12s</TableCell>
                                <TableCell><Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">Completed</Badge></TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-white/5 border-white/5 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg" />
                                        <div>
                                            <div className="font-bold text-white">Alex Rivera</div>
                                            <div className="text-xs text-muted-foreground">ID: #8824</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-300">Frontend Architecture</TableCell>
                                <TableCell className="font-bold text-sky-400">94/100</TableCell>
                                <TableCell className="font-mono text-zinc-400">32m 10s</TableCell>
                                <TableCell><Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">Completed</Badge></TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-white/5 border-white/5 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg" />
                                        <div>
                                            <div className="font-bold text-white">Marcus Chen</div>
                                            <div className="text-xs text-muted-foreground">ID: #8829</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-300">Database Optimization</TableCell>
                                <TableCell className="font-bold text-orange-400">88/100</TableCell>
                                <TableCell className="font-mono text-zinc-400">55m 00s</TableCell>
                                <TableCell><Badge variant="outline" className="border-yellow-500/50 text-yellow-500">In Progress</Badge></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
