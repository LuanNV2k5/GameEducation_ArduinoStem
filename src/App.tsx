/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lightbulb, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Play,
  RotateCcw,
  HelpCircle,
  Timer,
  Volume2,
  VolumeX
} from "lucide-react";
import YouTube from "react-youtube";

// --- Game Data ---
const QUESTIONS_DATA = [
  {q:"Quang trở (LDR) là loại linh kiện gì?", A:"Điện trở có giá trị cố định", B:"Điện trở thay đổi theo ánh sáng", C:"Linh kiện phát quang", D:"Linh kiện lưu trữ điện", correct:"B"},
  {q:"Khi ánh sáng chiếu vào quang trở tăng, điện trở của nó sẽ:", A:"Tăng lên", B:"Giảm xuống", C:"Không thay đổi", D:"Triệt tiêu về 0", correct:"B"},
  {q:"Trong môi trường tối hoàn toàn, điện trở của quang trở thường:", A:"Rất thấp", B:"Trung bình", C:"Rất cao", D:"Bằng 0", correct:"C"},
  {q:"Ứng dụng phổ biến nhất của quang trở là gì?", A:"Đo nhiệt độ", B:"Bật/tắt đèn tự động", C:"Đo khoảng cách", D:"Cân trọng lượng", correct:"B"},
  {q:"Để đọc giá trị analog, ta nối vào đâu?", A:"Digital", B:"Analog", C:"5V", D:"GND", correct:"B"},
  {q:"Khối lệnh nào dùng để đọc giá trị từ quang trở?", A:"Đọc digital", B:"Set output", C:"Đọc analog", D:"Gửi tin nhắn", correct:"C"},
  {q:"Giá trị analog Arduino Uno nằm trong khoảng:", A:"0-255", B:"0-100", C:"0-1023", D:"0-5", correct:"C"},
  {q:"Tại sao cần điện trở 10k?", A:"Làm đẹp", B:"Tạo mạch phân áp", C:"Bảo vệ", D:"Tăng sáng", correct:"B"},
  {q:"Điểm nối giữa LDR và điện trở nối vào đâu?", A:"GND", B:"5V", C:"Analog", D:"Digital", correct:"C"},
  {q:"Khối nào đọc A0?", A:"Đọc digital", B:"Đọc analog A0", C:"Set output", D:"Gửi tin nhắn", correct:"B"},
  {q:"Nếu đọc 1023 thì điện áp là:", A:"0V", B:"2.5V", C:"5V", D:"10V", correct:"C"},
  {q:"Khối nào để nhân vật nói?", A:"nói() trong 2s", B:"click", C:"đợi", D:"lặp", correct:"A"},
  {q:"Logic kiểm tra trời tối dùng:", A:"if + wait", B:"if + > <", C:"loop", D:"move", correct:"B"},
  {q:"Để đọc liên tục phải dùng:", A:"start", B:"if", C:"loop forever", D:"define", correct:"C"},
  {q:"Khoảng giá trị mBlock:", A:"0-1", B:"0-255", C:"0-1023", D:"-273-100", correct:"C"},
  {q:"Chất liệu LDR:", A:"Đồng", B:"Silic", C:"CdS", D:"Nhôm", correct:"C"},
  {q:"Ưu điểm LDR:", A:"Rẻ dễ dùng", B:"Nhanh", C:"Chính xác tuyệt đối", D:"Xuyên vật", correct:"A"},
  {q:"Ánh sáng mạnh điện áp:", A:"0V", B:"5V", C:"2.5V", D:"1V", correct:"B"},
  {q:"Bật LED khi tối:", A:"< ngưỡng", B:"> ngưỡng", C:"==0", D:"==1023", correct:"A"},
  {q:"Ngưỡng hợp lý:", A:"50", B:"500", C:"1000", D:"0", correct:"B"},
  {q:"Đơn vị ánh sáng:", A:"Độ C", B:"Lux", C:"Volt", D:"Ampere", correct:"B"},
  {q:"Thêm delay để:", A:"Tránh lag", B:"LED sáng hơn", C:"Không cháy", D:"Tiết kiệm điện", correct:"A"},
  {q:"Lưu giá trị vào biến:", A:"set 0", B:"set = đọc A0", C:"change", D:"show", correct:"B"},
  {q:"Bộ linh kiện gồm:", A:"Arduino,LDR,điện trở,LED", B:"Motor", C:"Chỉ Arduino", D:"LDR+loa", correct:"A"},
  {q:"Logic đúng:", A:"A0>500 tắt", B:"A0>500 bật", C:"A0<500 bật", D:"A0=0 tắt", correct:"B"}
];

const BLOCK_TYPES = [
  { id: "input_env", label: "Ánh sáng môi trường", category: "INPUT", icon: <Lightbulb className="w-5 h-5 text-yellow-500" /> },
  { id: "input_val", label: "Giá trị cảm biến ánh sáng", category: "INPUT", icon: <Zap className="w-5 h-5 text-blue-500" /> },
  { id: "process_cpu", label: "Arduino (so sánh ngưỡng)", category: "PROCESS", icon: <Cpu className="w-5 h-5 text-green-500" /> },
  { id: "output_on", label: "Đèn bật khi thiếu sáng", category: "OUTPUT", icon: <CheckCircle2 className="w-5 h-5 text-orange-500" /> },
  { id: "output_off", label: "Đèn tắt khi đủ sáng", category: "OUTPUT", icon: <XCircle className="w-5 h-5 text-gray-500" /> },
];

const IPO_ORDER = ["input_env", "input_val", "process_cpu", "output_on", "output_off"];

interface Team {
  name: string;
  questions: (typeof QUESTIONS_DATA[0] & { targetBlockId: string })[];
  unlocked: boolean[];
  placed: (string | null)[];
}

export default function App() {
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "FINISHED">("START");
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<{teamIndex: number, questionIndex: number} | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<{correct: boolean, msg: string} | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<{teamIndex: number, blockId: string} | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [completedTurns, setCompletedTurns] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeQuestion && gameState === "PLAYING") {
      setTimeLeft(30);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuestion, gameState]);

  const processTurnEnd = (teamIndex: number) => {
    setCompletedTurns(prev => {
      const next = [...prev, teamIndex];
      if (next.length >= 5) {
        return []; // Reset round
      }
      return next;
    });
  };

  const handleTimeout = () => {
    if (!activeQuestion) return;
    const { teamIndex } = activeQuestion;
    setShowFeedback({ correct: false, msg: "Hết giờ! Nhóm đã mất lượt, hãy đợi vòng tiếp theo." });
    setActiveQuestion(null);
    processTurnEnd(teamIndex);
    setTimeout(() => setShowFeedback(null), 2500);
  };

  // Initialize Game
  const initGame = () => {
    const allQuestions = [...QUESTIONS_DATA].sort(() => Math.random() - 0.5);
    const newTeams = Array.from({ length: 5 }, (_, i) => {
      // Pick 5 questions for this team
      const teamQuestionsBase = allQuestions.slice(i * 5, (i + 1) * 5);
      // Shuffle the 5 IPO blocks to assign them randomly to these questions
      const shuffledBlocks = [...IPO_ORDER].sort(() => Math.random() - 0.5);
      
      const teamQuestions = teamQuestionsBase.map((q, idx) => ({
        ...q,
        targetBlockId: shuffledBlocks[idx]
      }));

      return {
        name: `Nhóm ${i + 1}`,
        questions: teamQuestions,
        unlocked: [false, false, false, false, false],
        placed: [null, null, null, null, null],
      };
    });
    setTeams(newTeams);
    setGameState("PLAYING");
    setWinner(null);
    setCompletedTurns([]);
  };

  const handleAnswer = (answer: string) => {
    if (!activeQuestion) return;
    const { teamIndex, questionIndex } = activeQuestion;
    const currentQuestion = teams[teamIndex].questions[questionIndex];

    if (answer === currentQuestion.correct) {
      const newTeams = [...teams];
      newTeams[teamIndex].unlocked[questionIndex] = true;
      setTeams(newTeams);
      setShowFeedback({ correct: true, msg: "Chính xác! Linh kiện đã được mở khóa." });
      setTimeout(() => {
        setShowFeedback(null);
        setActiveQuestion(null);
        processTurnEnd(teamIndex);
      }, 1000);
    } else {
      setShowFeedback({ correct: false, msg: "Sai rồi! Nhóm đã mất lượt, hãy đợi vòng tiếp theo." });
      setTimeout(() => {
        setShowFeedback(null);
        setActiveQuestion(null);
        processTurnEnd(teamIndex);
      }, 1500);
    }
  };

  const onDrop = (teamIndex: number, slotIndex: number, blockId: string) => {
    const newTeams = [...teams];
    const team = newTeams[teamIndex];
    
    // Implementation of swap logic
    const sourceSlotIdx = team.placed.indexOf(blockId);
    const targetSlotBlockId = team.placed[slotIndex];

    if (sourceSlotIdx !== -1) {
      // Swapping two slots
      team.placed[sourceSlotIdx] = targetSlotBlockId;
      team.placed[slotIndex] = blockId;
    } else {
      // Placing from inventory
      team.placed[slotIndex] = blockId;
    }
    
    setTeams(newTeams);
  };

  const checkIPO = (teamIndex: number) => {
    const team = teams[teamIndex];
    const isCorrect = team.placed.every((val, idx) => val === IPO_ORDER[idx]);

    if (isCorrect) {
        setWinner(teamIndex + 1);
        setGameState("FINISHED");
        setShowFeedback({ correct: true, msg: `Chúc mừng ${team.name} đã hoàn thành xuất sắc!` });
    } else {
        const newTeams = [...teams];
        newTeams[teamIndex].placed = [null, null, null, null, null];
        setTeams(newTeams);
        setShowFeedback({ correct: false, msg: "Sai rồi! Bố trí IPO chưa đúng. Các mảnh ghép đã bị thu hồi." });
    }
    setTimeout(() => setShowFeedback(null), 2500);
  };

  const toggleMusic = () => {
    if (youtubePlayer) {
      if (isMuted) {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(50);
        youtubePlayer.playVideo();
      } else {
        youtubePlayer.mute();
      }
      setIsMuted(!isMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-sleek-bg text-sleek-text-main font-sans selection:bg-sleek-orange/30 overflow-x-hidden">
      {/* Hidden YouTube Player - 1x1 size is often safer than 0x0 */}
      <div className="opacity-0 pointer-events-none absolute -z-50 overflow-hidden w-px h-px">
        <YouTube
          videoId="sRrVLGRiguo"
          opts={{
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 1,
              loop: 1,
              playlist: 'sRrVLGRiguo',
              controls: 0,
              showinfo: 0,
              modestbranding: 1,
              origin: window.location.origin,
            },
          }}
          onReady={(event) => {
            const player = event.target;
            setYoutubePlayer(player);
            
            // Start playing immediately (muted to bypass autoplay restrictions)
            player.mute();
            player.playVideo();

            // Then check if the user had already clicked "unmute" before we were ready
            if (!isMuted) {
              // Slight delay to ensure playVideo() has started before unmuting
              setTimeout(() => {
                player.unMute();
                player.setVolume(50);
              }, 500);
            }
          }}
        />
      </div>

      {/* Header */}
      <header className="h-20 bg-sleek-card border-b-2 border-sleek-teal flex justify-between items-center px-6 shadow-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-sleek-teal rounded-lg shadow-lg flex items-center justify-center">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-sleek-teal">
              ARDUINO SENSOR IPO GAME
            </h1>
            <p className="text-[10px] text-sleek-text-dim uppercase tracking-widest font-bold">Hardware Education Tool</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleMusic}
            className={`p-2.5 bg-sleek-bg/50 border rounded-xl transition-all group flex items-center justify-center
              ${isMuted ? 'border-sleek-orange/50 animate-pulse hover:bg-sleek-orange/10' : 'border-sleek-border hover:bg-sleek-teal/20 hover:border-sleek-teal'}
            `}
            title={isMuted ? "Bật nhạc" : "Tắt nhạc"}
          >
            {isMuted ? (
              <div className="relative">
                <VolumeX className="w-5 h-5 text-sleek-orange group-hover:text-sleek-orange" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sleek-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sleek-orange"></span>
                </span>
              </div>
            ) : (
              <Volume2 className="w-5 h-5 text-sleek-teal animate-pulse" />
            )}
          </button>

          {gameState !== "START" && (
            <button 
              onClick={() => setGameState("START")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sleek-border hover:bg-sleek-border transition-all text-xs font-black uppercase text-sleek-text-dim hover:text-white"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {gameState === "START" ? (
          <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sleek-card p-6 md:p-12 rounded-[2.5rem] border border-sleek-border shadow-2xl max-w-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sleek-teal/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="mb-6 inline-flex p-4 bg-sleek-teal/10 rounded-3xl border border-sleek-teal/20">
                <Cpu className="w-12 h-12 text-sleek-teal" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 italic text-sleek-text-main uppercase">
                KÉO-THẢ <span className="text-sleek-teal">IPO</span>
              </h2>
              <div className="text-sleek-text-dim mb-10 text-sm md:text-lg space-y-4 font-medium">
                <p>💡 <strong>Nhiệm vụ:</strong> Trả lời câu hỏi để mở khóa mảnh ghép.</p>
                <p>🖱️ <strong>Kéo thả:</strong> Mảnh ghép vào sơ đồ IPO (Input - Process - Output).</p>
                <p>🏆 <strong>Chiến thắng:</strong> Nhóm nào hoàn thành nhanh nhất!</p>
              </div>
              <button 
                onClick={initGame}
                className="group relative px-10 py-4 bg-sleek-orange hover:bg-orange-500 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-sleek-orange/30 mx-auto"
              >
                <Play className="fill-current w-6 h-6" /> BẮT ĐẦU CHƠI
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {teams.map((team, tIdx) => {
              const isLocked = completedTurns.includes(tIdx);
              const isCurrentlyAnswering = activeQuestion?.teamIndex === tIdx;
              
              return (
              <div 
                key={tIdx} 
                className={`flex flex-col gap-4 p-5 rounded-[2.5rem] border transition-all duration-500 relative
                  ${isCurrentlyAnswering ? 'border-sleek-teal bg-white ring-8 ring-sleek-teal/10 scale-[1.02] z-20 shadow-[-20px_20px_60px_rgba(8,145,178,0.15)]' : ''}
                  ${isLocked ? 'border-sleek-border bg-sleek-card/20 shadow-none' : 'border-sleek-teal/30 bg-sleek-card/80 shadow-lg'}
                  ${winner === tIdx + 1 ? 'border-sleek-green bg-sleek-green/5 ring-4 ring-sleek-green/10 z-10' : ''}
                `}
              >
                {isLocked && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sleek-border-dim/80 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-sm z-10 shadow-lg outline outline-1 outline-white/10">
                    Chờ vòng sau
                  </div>
                )}
                {!isLocked && winner === null && (
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sleek-orange text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-10 animate-pulse">
                    Sẵn sàng
                  </div>
                )}
                <div className="flex justify-between items-center border-b border-sleek-border pb-3">
                  <h3 className={`text-xl font-black tracking-tight ${winner === tIdx + 1 ? 'text-sleek-green' : 'text-sleek-teal'}`}>
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {team.placed.every(p => p !== null) && winner === null && (
                        <button 
                            onClick={() => checkIPO(tIdx)}
                            className="px-3 py-1 bg-sleek-green text-white text-[10px] font-black rounded-lg hover:scale-105 active:scale-95 transition-transform"
                        >
                            KIỂM TRA
                        </button>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1 bg-sleek-bg rounded-full border border-sleek-border">
                        <span className="text-[10px] font-black tracking-widest text-sleek-orange uppercase">Score</span>
                        <span className="text-xs font-black text-sleek-text-main">{team.placed.filter(p => p).length * 100}</span>
                    </div>
                  </div>
                </div>

                {/* IPO Diagram - Sleek 3-Column Layout */}
                <div className="grid grid-cols-3 gap-3 bg-sleek-bg/50 p-4 rounded-3xl border border-sleek-border/50">
                    {/* INPUT SECTION */}
                    <div className="flex flex-col gap-2">
                        <div className="text-[9px] font-black text-sleek-text-dim text-center border-b border-sleek-border pb-1 uppercase tracking-widest">Input</div>
                        {[0, 1].map(slotIdx => {
                            const placedBlockId = team.placed[slotIdx];
                            const blockData = BLOCK_TYPES.find(b => b.id === placedBlockId);
                            return (
                                <div 
                                    key={slotIdx}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (draggedBlock && draggedBlock.teamIndex === tIdx) {
                                          onDrop(tIdx, slotIdx, draggedBlock.blockId);
                                      }
                                    }}
                                    className={`relative z-10 w-full min-h-[75px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300
                                      ${placedBlockId ? 'border-sleek-green bg-sleek-green/20 border-solid cursor-grab active:cursor-grabbing' : 'border-sleek-border bg-sleek-bg shadow-inner'}
                                      ${draggedBlock && draggedBlock.teamIndex === tIdx ? 'scale-105 border-sleek-orange' : ''}
                                      ${isLocked && !placedBlockId ? 'opacity-50 border-sleek-border/60' : ''}
                                    `}
                                    draggable={!!placedBlockId}
                                    onDragStart={() => placedBlockId && setDraggedBlock({ teamIndex: tIdx, blockId: placedBlockId })}
                                    onDragEnd={() => setDraggedBlock(null)}
                                >
                                    {placedBlockId ? (
                                      <div className="flex flex-col items-center gap-1 p-1 text-center">
                                        {blockData?.icon}
                                        <span className={`text-[9px] font-black leading-tight break-words max-w-full ${isLocked ? 'text-sleek-text-dim' : ''}`}>{blockData?.label}</span>
                                      </div>
                                    ) : (
                                        <div className="text-[8px] text-sleek-text-dim font-black uppercase opacity-20">?</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* PROCESS SECTION */}
                    <div className="flex flex-col gap-2">
                        <div className="text-[9px] font-black text-sleek-text-dim text-center border-b border-sleek-border pb-1 uppercase tracking-widest">Process</div>
                        <div className="mt-8">
                            {[2].map(slotIdx => {
                                const placedBlockId = team.placed[slotIdx];
                                const blockData = BLOCK_TYPES.find(b => b.id === placedBlockId);
                                return (
                                    <div 
                                        key={slotIdx}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          if (draggedBlock && draggedBlock.teamIndex === tIdx) {
                                              onDrop(tIdx, slotIdx, draggedBlock.blockId);
                                          }
                                        }}
                                        className={`relative z-10 w-full min-h-[80px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300
                                          ${placedBlockId ? 'border-sleek-green bg-sleek-green/20 border-solid cursor-grab active:cursor-grabbing' : 'border-sleek-border bg-sleek-bg shadow-inner'}
                                          ${draggedBlock && draggedBlock.teamIndex === tIdx ? 'scale-105 border-sleek-orange' : ''}
                                          ${isLocked && !placedBlockId ? 'opacity-50 border-sleek-border/60' : ''}
                                        `}
                                        draggable={!!placedBlockId}
                                        onDragStart={() => placedBlockId && setDraggedBlock({ teamIndex: tIdx, blockId: placedBlockId })}
                                        onDragEnd={() => setDraggedBlock(null)}
                                    >
                                        {placedBlockId ? (
                                          <div className="flex flex-col items-center gap-1 p-1 text-center">
                                            {blockData?.icon}
                                            <span className={`text-[9px] font-black leading-tight break-words max-w-full ${isLocked ? 'text-sleek-text-dim' : ''}`}>{blockData?.label}</span>
                                          </div>
                                        ) : (
                                            <div className="text-[8px] text-sleek-text-dim font-black uppercase opacity-20">?</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* OUTPUT SECTION */}
                    <div className="flex flex-col gap-2">
                        <div className="text-[9px] font-black text-sleek-text-dim text-center border-b border-sleek-border pb-1 uppercase tracking-widest">Output</div>
                        {[3, 4].map(slotIdx => {
                            const placedBlockId = team.placed[slotIdx];
                            const blockData = BLOCK_TYPES.find(b => b.id === placedBlockId);
                            return (
                                <div 
                                    key={slotIdx}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (draggedBlock && draggedBlock.teamIndex === tIdx) {
                                          onDrop(tIdx, slotIdx, draggedBlock.blockId);
                                      }
                                    }}
                                    className={`relative z-10 w-full min-h-[75px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300
                                      ${placedBlockId ? 'border-sleek-green bg-sleek-green/20 border-solid cursor-grab active:cursor-grabbing' : 'border-sleek-border bg-sleek-bg shadow-inner'}
                                      ${draggedBlock && draggedBlock.teamIndex === tIdx ? 'scale-105 border-sleek-orange' : ''}
                                      ${isLocked && !placedBlockId ? 'opacity-50 border-sleek-border/60' : ''}
                                    `}
                                    draggable={!!placedBlockId}
                                    onDragStart={() => placedBlockId && setDraggedBlock({ teamIndex: tIdx, blockId: placedBlockId })}
                                    onDragEnd={() => setDraggedBlock(null)}
                                >
                                    {placedBlockId ? (
                                      <div className="flex flex-col items-center gap-1 p-1 text-center">
                                        {blockData?.icon}
                                        <span className={`text-[9px] font-black leading-tight break-words max-w-full ${isLocked ? 'text-sleek-text-dim' : ''}`}>{blockData?.label}</span>
                                      </div>
                                    ) : (
                                        <div className="text-[8px] text-sleek-text-dim font-black uppercase opacity-20">?</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Question Blocks Bank */}
                <div className="mt-auto pt-4 border-t border-sleek-border">
                    <p className="text-[10px] font-black text-sleek-text-dim uppercase tracking-widest mb-3 text-center">Mảnh ghép</p>
                    <div className="grid grid-cols-5 gap-2">
                    {team.questions.map((q, qIdx) => {
                        const isUnlocked = team.unlocked[qIdx];
                        const blockId = q.targetBlockId;
                        const blockData = BLOCK_TYPES.find(b => b.id === blockId);
                        const isPlaced = team.placed.includes(blockId);

                        return (
                            <div key={qIdx} className="relative aspect-square">
                                {!isUnlocked ? (
                                    <button
                                        onClick={() => !isLocked && setActiveQuestion({ teamIndex: tIdx, questionIndex: qIdx })}
                                        disabled={isLocked}
                                        className={`w-full h-full rounded-xl flex items-center justify-center transition-all group active:scale-95
                                          ${!isLocked ? 'bg-sleek-border/30 hover:bg-sleek-orange/80 cursor-pointer shadow-sm' : 'bg-sleek-border/10 cursor-not-allowed grayscale opacity-30'}
                                        `}
                                    >
                                        <HelpCircle className={`w-5 h-5 transition-transform ${!isLocked ? 'group-hover:scale-110 text-sleek-text-dim group-hover:text-white' : 'text-sleek-text-dim/20'}`} />
                                    </button>
                                ) : isPlaced ? (
                                    <div className="w-full h-full bg-sleek-green/5 rounded-xl flex items-center justify-center border border-sleek-green/10 opacity-30">
                                        <CheckCircle2 className="w-5 h-5 text-sleek-green" />
                                    </div>
                                ) : (
                                    <motion.div
                                        draggable
                                        onDragStart={() => setDraggedBlock({ teamIndex: tIdx, blockId: blockId })}
                                        onDragEnd={() => setDraggedBlock(null)}
                                        whileHover={{ scale: 1.1, rotate: 2 }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                                        className="w-full h-full bg-sleek-orange cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg border border-white/20"
                                    >
                                        {React.cloneElement(blockData?.icon as React.ReactElement, { className: "w-5 h-5 text-white" })}
                                    </motion.div>
                                )}
                            </div>
                        )
                    })}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </main>

      {/* Question Modal */}
      <AnimatePresence>
        {activeQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-sleek-card border-2 border-sleek-teal rounded-[2.5rem] w-full max-w-xl p-8 md:p-12 shadow-[0_20px_60px_rgba(8,145,178,0.2)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-sleek-teal/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-sleek-teal p-3 rounded-2xl shadow-lg">
                    <HelpCircle className="text-white w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sleek-teal font-black uppercase tracking-[0.2em] text-[10px]">
                        {teams[activeQuestion.teamIndex].name} • CÂU HỎI {activeQuestion.questionIndex + 1}/5
                    </h4>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-colors ${timeLeft <= 10 ? 'border-red-500 bg-red-50 text-red-500 animate-pulse' : 'border-sleek-teal/20 bg-sleek-bg text-sleek-teal'}`}>
                    <Timer className="w-4 h-4" />
                    <span className="text-lg font-black tabular-nums">{timeLeft}s</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-sleek-border/20 rounded-full mb-8 overflow-hidden">
                <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / 30) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-sleek-teal'}`}
                />
              </div>

              <p className="text-xl md:text-2xl font-black mb-10 text-sleek-text-main leading-tight">
                {teams[activeQuestion.teamIndex].questions[activeQuestion.questionIndex].q}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {['A', 'B', 'C', 'D'].map((opt) => (
                   <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="group flex items-center gap-4 p-5 rounded-2xl bg-sleek-border/20 hover:bg-sleek-border/40 border border-sleek-border hover:border-sleek-teal/50 text-left transition-all active:scale-[0.98]"
                   >
                     <div className="w-10 h-10 rounded-xl bg-sleek-card border border-sleek-border group-hover:bg-sleek-teal flex items-center justify-center font-black text-sleek-teal group-hover:text-white transition-colors">
                        {opt}
                     </div>
                     <span className="text-sm text-sleek-text-main font-bold">
                        {(teams[activeQuestion.teamIndex].questions[activeQuestion.questionIndex] as any)[opt]}
                     </span>
                   </button>
                 ))}
              </div>

              <button 
                onClick={() => setActiveQuestion(null)}
                className="mt-10 text-sleek-text-dim hover:text-white transition-colors w-full text-center text-[10px] font-black uppercase tracking-widest"
              >
                Đóng / Tiếp tục sau
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl z-[100] flex items-center gap-3 font-bold border-2 ${showFeedback.correct ? 'bg-sleek-green border-white/20' : 'bg-red-600 border-white/20'}`}
          >
            {showFeedback.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-white">{showFeedback.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Modal */}
      <AnimatePresence>
        {gameState === "FINISHED" && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-sleek-card border-4 border-sleek-green p-12 md:p-20 rounded-[4rem] text-center shadow-[0_0_100px_rgba(34,197,94,0.3)] max-w-2xl relative"
                >
                    <Trophy className="w-32 h-32 text-sleek-green mx-auto mb-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                    
                    <h2 className="text-6xl md:text-8xl font-black italic mb-4 tracking-tighter text-sleek-text-main uppercase">VICTORY</h2>
                    <p className="text-2xl md:text-3xl font-black text-sleek-green mb-12 uppercase tracking-widest">
                        NHÓM {winner} CHIẾN THẮNG! 🎉
                    </p>
                    
                    <button 
                        onClick={initGame}
                        className="bg-sleek-orange hover:bg-orange-500 text-white px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-3 transition-all transform hover:scale-105 mx-auto shadow-2xl shadow-sleek-orange/40"
                    >
                        <RotateCcw className="w-6 h-6" /> CHƠI LẠI
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Shapes Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-10 overflow-hidden">
         <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-600 rounded-full blur-[100px]" />
         <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-green-600 rounded-full blur-[100px]" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-neutral-700/50 rounded-full scale-150 rotate-45" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient {
            background-size: 200% 200%;
            animation: flow 5s ease infinite;
        }
      `}} />
    </div>
  );
}
