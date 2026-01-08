/**
 * Agent Detail Page - Full interaction UI for individual agents
 * Video game character profile + command center
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft, Send, Mic, MicOff, Sparkles, Zap, Shield, Search,
  Activity, Rocket, Clock, CheckCircle, XCircle, AlertTriangle,
  Terminal, MessageSquare, History, Settings, Play, Pause,
  ChevronRight, Volume2, VolumeX, Bot, Cpu, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { StarField3D } from '@/components/cockpit/GameUI/StarField3D'

const AGENT_DATA: Record<string, {
  displayName: string
  type: string
  tagline: string
  description: string
  capabilities: string[]
  personality: string
  icon: any
  color: string
  gradient: string
  borderColor: string
  examples: string[]
}> = {
  sirius: {
    displayName: 'Sirius',
    type: 'The Navigator',
    tagline: 'Your strategic project commander',
    description: 'Sirius orchestrates your projects with precision. From planning campaigns to coordinating team efforts, Sirius ensures every initiative moves forward efficiently.',
    capabilities: ['Task Planning', 'Team Coordination', 'Workflow Design', 'Decision Making', 'Priority Management', 'Timeline Creation'],
    personality: 'Strategic, organized, and always thinking three steps ahead.',
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30',
    examples: [
      'Plan a fundraising campaign for the summer',
      'Create a timeline for our new website launch',
      'Help me prioritize our grant applications',
      'Organize our volunteer training schedule',
    ],
  },
  andromeda: {
    displayName: 'Andromeda',
    type: 'The Coder',
    tagline: 'Your digital craftsman',
    description: 'Andromeda transforms your ideas into working code. From building donation forms to creating beautiful landing pages, your technical vision becomes reality.',
    capabilities: ['Web Development', 'Form Building', 'Bug Fixing', 'Feature Creation', 'UI Design', 'Database Work'],
    personality: 'Creative, detail-oriented, and passionate about clean code.',
    icon: Sparkles,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/30',
    examples: [
      'Build a donation form with recurring options',
      'Create a volunteer signup page',
      'Fix the mobile navigation menu',
      'Add a progress bar to our campaign page',
    ],
  },
  vega: {
    displayName: 'Vega',
    type: 'The Validator',
    tagline: 'Your quality guardian',
    description: 'Vega ensures everything works perfectly. From testing forms to checking mobile responsiveness, nothing escapes Vega\'s thorough inspection.',
    capabilities: ['UI Testing', 'Mobile Check', 'Link Verification', 'Performance Testing', 'Accessibility Audit', 'Form Validation'],
    personality: 'Meticulous, thorough, and never satisfied until everything is perfect.',
    icon: Shield,
    color: 'cyan',
    gradient: 'from-blue-500 to-cyan-600',
    borderColor: 'border-cyan-500/30',
    examples: [
      'Test the donation form on all devices',
      'Check all links on our website',
      'Audit our site for accessibility',
      'Run performance tests on the homepage',
    ],
  },
  rigel: {
    displayName: 'Rigel',
    type: 'The Researcher',
    tagline: 'Your knowledge seeker',
    description: 'Rigel finds the answers you need. From grant opportunities to industry best practices, Rigel digs deep to provide actionable insights.',
    capabilities: ['Web Research', 'Data Analysis', 'Grant Finding', 'Best Practices', 'Competitor Analysis', 'Trend Spotting'],
    personality: 'Curious, analytical, and always eager to learn more.',
    icon: Search,
    color: 'rose',
    gradient: 'from-red-500 to-rose-600',
    borderColor: 'border-rose-500/30',
    examples: [
      'Find grant opportunities for education nonprofits',
      'Research best practices for donor retention',
      'Analyze our website traffic patterns',
      'Look up successful fundraising campaigns',
    ],
  },
  cassiopeia: {
    displayName: 'Cassiopeia',
    type: 'The Communicator',
    tagline: 'Your message amplifier',
    description: 'Cassiopeia makes complex things simple. From writing impact reports to explaining technical concepts, Cassiopeia ensures your message resonates.',
    capabilities: ['Clear Explanations', 'Report Writing', 'Summarization', 'Translation', 'Content Creation', 'Email Drafting'],
    personality: 'Eloquent, empathetic, and skilled at connecting with any audience.',
    icon: Activity,
    color: 'emerald',
    gradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-emerald-500/30',
    examples: [
      'Write our monthly impact report',
      'Explain our programs to new donors',
      'Summarize this grant application',
      'Draft a thank-you email for donors',
    ],
  },
  betelgeuse: {
    displayName: 'Betelgeuse',
    type: 'The Builder',
    tagline: 'Your infrastructure architect',
    description: 'Betelgeuse keeps everything running smoothly. From deploying updates to managing servers, your technical infrastructure is in safe hands.',
    capabilities: ['Service Deployment', 'Website Hosting', 'Database Management', 'Monitoring', 'Backup Management', 'Security Updates'],
    personality: 'Reliable, powerful, and always working behind the scenes.',
    icon: Rocket,
    color: 'yellow',
    gradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-500/30',
    examples: [
      'Deploy the latest website updates',
      'Check our server health status',
      'Set up automatic backups',
      'Update our security certificates',
    ],
  },
}

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface TaskHistory {
  id: string
  action: string
  status: 'completed' | 'failed' | 'running'
  timestamp: Date
  duration?: string
}

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentName = (params.name as string)?.toLowerCase()
  const agent = AGENT_DATA[agentName]

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([])
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'stats'>('chat')
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    successRate: 0,
    avgResponseTime: '0.0s',
    lastActive: new Date().toISOString(),
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/agents/stats')
        const data = await response.json()
        if (data.success) {
          const agentStats = data.agents.find((a: any) =>
            a.name.toLowerCase() === agentName
          )
          if (agentStats) {
            setStats(agentStats.stats)
          }
        }
      } catch (error) {
        console.error('Failed to fetch agent stats:', error)
      }
    }
    fetchStats()
  }, [agentName])

  useEffect(() => {
    setTaskHistory([
      { id: '1', action: 'Analyzed project requirements', status: 'completed', timestamp: new Date(Date.now() - 3600000), duration: '2.3s' },
      { id: '2', action: 'Generated implementation plan', status: 'completed', timestamp: new Date(Date.now() - 7200000), duration: '1.8s' },
      { id: '3', action: 'Reviewed code changes', status: 'completed', timestamp: new Date(Date.now() - 10800000), duration: '3.1s' },
    ])
  }, [])

  if (!agent) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <StarField3D />
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">🤖</div>
          <h1 className="text-4xl font-bold text-white mb-4">Agent Not Found</h1>
          <p className="text-slate-400 mb-8">The agent "{agentName}" doesn't exist.</p>
          <Link
            href="/cockpit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mission Control
          </Link>
        </div>
      </div>
    )
  }

  const Icon = agent.icon

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sent',
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agent.displayName,
          action: 'process_request',
          parameters: { message: userMessage.content },
        }),
      })

      const data = await response.json()

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.result?.message || data.result?.details || 'I\'ve processed your request. How else can I help?',
        timestamp: new Date(),
        status: 'sent',
      }

      setMessages(prev => [...prev, agentMessage])

      setTaskHistory(prev => [{
        id: Date.now().toString(),
        action: userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : ''),
        status: 'completed',
        timestamp: new Date(),
        duration: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
      }, ...prev])

      if (isSpeaking && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(agentMessage.content)
        utterance.rate = 0.9
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'I encountered an issue processing your request. Please try again.',
        timestamp: new Date(),
        status: 'error',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue(transcript)
    }

    recognition.start()
  }

  const handleExampleClick = (example: string) => {
    setInputValue(example)
    inputRef.current?.focus()
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarField3D />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-b ${agent.borderColor} bg-slate-900/80 backdrop-blur-xl`}
        >
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/cockpit"
                  className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </Link>

                <div className="flex items-center gap-4">
                  <div className={`relative p-4 bg-gradient-to-br ${agent.gradient} rounded-2xl`}>
                    <Icon className="w-8 h-8 text-white" />
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${agent.gradient} rounded-2xl blur-lg opacity-50`}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{agent.displayName}</h1>
                    <p className="text-slate-400 font-medium">{agent.type}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-white">{stats.tasksCompleted}</div>
                  <div className="text-xs text-slate-400">Tasks Done</div>
                </div>
                <div className="text-center px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-green-400">{stats.successRate}%</div>
                  <div className="text-xs text-slate-400">Success</div>
                </div>
                <div className="text-center px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-cyan-400">{stats.avgResponseTime}</div>
                  <div className="text-xs text-slate-400">Avg Speed</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Agent Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Agent Card */}
              <div className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${agent.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition`} />
                <div className="relative bg-slate-900/90 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
                  <p className="text-lg text-white mb-2 font-medium">{agent.tagline}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{agent.description}</p>

                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Personality</h4>
                    <p className="text-sm text-slate-500 italic">"{agent.personality}"</p>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className={`px-3 py-1.5 bg-slate-800/80 text-slate-300 rounded-full text-sm border border-slate-700/50 hover:${agent.borderColor} transition-colors`}
                    >
                      {cap}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Quick Examples */}
              <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  Try These Commands
                </h3>
                <div className="space-y-2">
                  {agent.examples.map((example, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{example}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Panel - Chat & History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {[
                  { id: 'chat', label: 'Chat', icon: MessageSquare },
                  { id: 'history', label: 'History', icon: History },
                  { id: 'stats', label: 'Stats', icon: BarChart3 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${agent.gradient} text-white`
                        : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Panels */}
              <AnimatePresence mode="wait">
                {activeTab === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden"
                  >
                    {/* Messages */}
                    <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <motion.div
                            className={`p-6 bg-gradient-to-br ${agent.gradient} rounded-3xl mb-6`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                          >
                            <Icon className="w-12 h-12 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Ready to help!
                          </h3>
                          <p className="text-slate-400 max-w-md">
                            Ask me anything or click one of the example commands to get started.
                          </p>
                        </div>
                      )}

                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {message.role === 'agent' && (
                              <div className={`p-2 bg-gradient-to-br ${agent.gradient} rounded-xl flex-shrink-0`}>
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                  : 'bg-slate-800 text-slate-200 border border-slate-700/50'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 bg-gradient-to-br ${agent.gradient} rounded-xl`}>
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700/50">
                              <div className="flex items-center gap-2">
                                <motion.div className="w-2 h-2 bg-cyan-400 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} />
                                <motion.div className="w-2 h-2 bg-cyan-400 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} />
                                <motion.div className="w-2 h-2 bg-cyan-400 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-700/50 p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsSpeaking(!isSpeaking)}
                          className={`p-3 rounded-xl transition-all ${
                            isSpeaking
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                          }`}
                          title={isSpeaking ? 'Disable voice responses' : 'Enable voice responses'}
                        >
                          {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>

                        <div className="flex-1 relative">
                          <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={`Ask ${agent.displayName} anything...`}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            disabled={isProcessing}
                          />
                        </div>

                        <button
                          onClick={handleVoiceInput}
                          className={`p-3 rounded-xl transition-all ${
                            isListening
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-cyan-500/30 hover:text-cyan-400'
                          }`}
                          title="Voice input"
                        >
                          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isProcessing}
                          className={`p-3 bg-gradient-to-r ${agent.gradient} rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`}
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700/50 p-6 min-h-[500px]"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Task History</h3>
                    <div className="space-y-3">
                      {taskHistory.map((task, i) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                        >
                          <div className={`p-2 rounded-lg ${
                            task.status === 'completed' ? 'bg-green-500/20' :
                            task.status === 'failed' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                          }`}>
                            {task.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                             task.status === 'failed' ? <XCircle className="w-5 h-5 text-red-400" /> :
                             <Activity className="w-5 h-5 text-yellow-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{task.action}</p>
                            <p className="text-xs text-slate-500">
                              {task.timestamp.toLocaleString()} {task.duration && `• ${task.duration}`}
                            </p>
                          </div>
                        </motion.div>
                      ))}

                      {taskHistory.length === 0 && (
                        <div className="text-center py-12">
                          <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">No task history yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700/50 p-6 min-h-[500px]"
                  >
                    <h3 className="text-lg font-semibold text-white mb-6">Performance Statistics</h3>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-3xl font-bold text-white mb-1">{stats.tasksCompleted}</div>
                        <div className="text-sm text-slate-400">Total Tasks Completed</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-3xl font-bold text-green-400 mb-1">{stats.successRate}%</div>
                        <div className="text-sm text-slate-400">Success Rate</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-3xl font-bold text-cyan-400 mb-1">{stats.avgResponseTime}</div>
                        <div className="text-sm text-slate-400">Average Response Time</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-3xl font-bold text-purple-400 mb-1">Active</div>
                        <div className="text-sm text-slate-400">Current Status</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3">Activity Over Time</h4>
                      <div className="flex items-end gap-1 h-24">
                        {[...Array(24)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.random() * 100}%` }}
                            transition={{ delay: i * 0.02, duration: 0.5 }}
                            className={`flex-1 bg-gradient-to-t ${agent.gradient} rounded-t opacity-60 hover:opacity-100 transition-opacity`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>24h ago</span>
                        <span>Now</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
