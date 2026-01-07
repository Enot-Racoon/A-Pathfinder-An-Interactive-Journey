
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, MapPin, Target, Play, RotateCcw, Info, Lightbulb, Code, AlertTriangle, Layers, Compass, Zap, Search } from 'lucide-react';
import InteractiveGrid from './components/InteractiveGrid.tsx';
import { AlgorithmStep } from './types.ts';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<AlgorithmStep>(1);

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 8) as AlgorithmStep);
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1) as AlgorithmStep);

  const Section: React.FC<{ step: number; title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ step, title, icon, children }) => (
    <div className={`transition-all duration-500 transform ${activeStep === step ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 hidden'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-200">
          {icon}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{title}</h2>
      </div>
      <div className="text-slate-600 space-y-6 text-lg leading-relaxed">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 md:px-8 bg-slate-50 font-sans">
      <header className="max-w-4xl w-full mb-12 text-center">
        <div className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-indigo-600 uppercase bg-indigo-100 rounded-full">
          Интерактивный учебник
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Как роботы находят путь?
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Разбираем алгоритм A* без заумных формул, на примерах и картинках.
        </p>
      </header>

      <main className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 md:p-16 relative overflow-hidden border border-white">
        {/* Progress Tracker */}
        <div className="absolute top-0 left-0 w-full flex h-1.5 bg-slate-100">
          {[1,2,3,4,5,6,7,8].map(s => (
            <div key={s} className={`flex-1 transition-all duration-700 ${activeStep >= s ? 'bg-indigo-500' : 'bg-transparent'}`} />
          ))}
        </div>

        {/* Step 1: Problem */}
        <Section step={AlgorithmStep.PROBLEM} title="В чем задача?" icon={<Info size={28} />}>
          <p>
            Представь, что ты — <b>робот-пылесос</b>. Тебе нужно проехать из кухни в спальню. 
          </p>
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 my-6">
            <p className="text-amber-900 m-0 italic font-medium">
              «Я знаю, где старт. Я знаю, где финиш. Но посередине — лабиринт из коробок и стен. Как мне найти самую короткую дорогу, не тыкаясь в каждый угол?»
            </p>
          </div>
          <p>
            Компьютер видит мир как сетку клеток. Задача — перебирать эти клетки так, чтобы как можно быстрее найти цепочку от старта до конца.
          </p>
        </Section>

        {/* Step 2: Naive */}
        <Section step={AlgorithmStep.NAIVE} title="Первая идея: «Жадность»" icon={<Zap size={28} />}>
          <p>
            Самое простое: всегда идти в ту клетку, которая <b>просто ближе</b> к финишу.
          </p>
          <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center my-6">
            <div className="text-4xl mb-2">🛑</div>
            <h4 className="font-bold text-red-900 mb-2">Это плохая идея!</h4>
            <p className="text-red-800 text-sm">
              Если перед роботом стена, он упрется в её центр и застрянет, потому что центр стены «ближе» к цели. Он не поймет, что нужно сначала отойти в бок.
            </p>
          </div>
          <p>Нам нужно что-то поумнее.</p>
        </Section>

        {/* Step 3: Improvements */}
        <Section step={AlgorithmStep.IMPROVEMENT} title="Две подсказки сразу" icon={<Layers size={28} />}>
          <p>
            Чтобы не тупить, робот должен считать две цифры для каждой клетки:
          </p>
          <div className="flex flex-col md:flex-row gap-4 my-8">
            <div className="flex-1 p-6 bg-blue-50 rounded-3xl border border-blue-100">
               <span className="text-blue-600 font-black text-2xl">G</span>
               <p className="font-bold text-slate-800 mt-2">Прошлое</p>
               <p className="text-xs">Сколько шагов я уже прошел от старта?</p>
            </div>
            <div className="flex-1 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
               <span className="text-emerald-600 font-black text-2xl">H</span>
               <p className="font-bold text-slate-800 mt-2">Будущее</p>
               <p className="text-xs">Сколько (примерно) осталось до цели?</p>
            </div>
          </div>
          <p className="text-center bg-indigo-600 text-white p-6 rounded-2xl font-bold text-xl">
            Общая цена (F) = G + H
          </p>
        </Section>

        {/* Step 4: Visual Simulator */}
        <Section step={AlgorithmStep.VISUALIZATION} title="Интерактивная практика" icon={<Compass size={28} />}>
          <p className="mb-4">
            Попробуй сам. Нарисуй стену и нажми <b>«Найти путь»</b>. 
          </p>
          <InteractiveGrid />
          <p className="text-sm text-slate-400 text-center mt-4 italic">
            Синие клетки — те, что робот «пощупал». Зеленые — финальный лучший путь.
          </p>
        </Section>

        {/* Step 5: popCheapest Explanation */}
        <Section step={AlgorithmStep.IMPLEMENTATION} title="Как работает «мозг»?" icon={<Search size={28} />}>
          <p>
            Ты спрашивал, как устроено <b>выбирание самой дешевой клетки</b>. Это называется «Списком ожидания».
          </p>
          
          <div className="space-y-4 my-8">
            <div className="flex gap-4 items-start bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <p className="text-sm">Робот смотрит на всех «соседей» и считает их цену <b>F = G + H</b>.</p>
            </div>
            <div className="flex gap-4 items-start bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <p className="text-sm">Он записывает их в список. Но список постоянно <b>сортируется</b>: самые дешевые всегда сверху.</p>
            </div>
            <div className="flex gap-4 items-start bg-indigo-50 p-5 rounded-2xl border border-indigo-200">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <p className="text-sm"><b>Pop Cheapest:</b> Робот просто берет первую (самую выгодную) клетку из списка и идет в неё. Это гарантирует, что мы не идем туда, где «дорого».</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-indigo-300 font-mono text-xs shadow-xl">
            <p className="text-slate-500">// В коде это выглядит так:</p>
            <p><span className="text-white">openList.sort</span>((a, b) => a.f - b.f); <span className="text-slate-500">// Сортируем</span></p>
            <p><span className="text-white">let current</span> = openList.shift(); <span className="text-slate-500">// Берем самую дешевую</span></p>
          </div>
        </Section>

        {/* Step 6: Naming */}
        <Section step={AlgorithmStep.NAMING} title="Знакомься: Алгоритм A*" icon={<MapPin size={28} />}>
          <p>
            То, что ты сейчас понял, программисты называют <b>Алгоритмом A* (A-star)</b>.
          </p>
          <div className="p-8 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 text-center">
            <h4 className="font-black text-indigo-900 mb-2 italic text-2xl">A* = «Идеальный поиск»</h4>
            <p className="text-indigo-800 text-sm mb-0">
              «Звездочка» в названии означает, что математически доказано: этот способ ВСЕГДА находит самый короткий путь, если мы правильно оцениваем расстояние.
            </p>
          </div>
        </Section>

        {/* Step 7: Limitations */}
        <Section step={AlgorithmStep.LIMITATIONS} title="В чем подвох?" icon={<AlertTriangle size={28} />}>
          <p>Если всё так круто, почему не использовать только его?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-bold text-red-900 mb-1">Память</p>
                <p className="text-xs text-red-800">Нужно помнить КАЖДУЮ клетку, которую проверили. В огромных мирах это может «съесть» всю оперативку.</p>
             </div>
             <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-bold text-red-900 mb-1">Расчеты</p>
                <p className="text-xs text-red-800">Если мир меняется (стены двигаются), роботу приходится начинать всё сначала.</p>
             </div>
          </div>
        </Section>

        {/* Step 8: Extensions */}
        <Section step={AlgorithmStep.EXTENSIONS} title="Где это в жизни?" icon={<RotateCcw size={28} />}>
          <div className="flex flex-wrap gap-4 justify-center my-6">
             {['🗺️ Навигаторы', '🎮 Враги в играх', '📦 Складские роботы', '🚀 Марсоходы'].map(item => (
               <span key={item} className="px-6 py-3 bg-slate-100 rounded-full font-bold text-slate-700">{item}</span>
             ))}
          </div>
          <p className="text-center font-bold text-indigo-600 mt-8">
            Теперь ты знаешь, как работает навигация в твоем телефоне и в твоей любимой игре!
          </p>
        </Section>

        {/* Navigation */}
        <footer className="mt-16 flex justify-between items-center border-t border-slate-100 pt-10">
          <button 
            onClick={prevStep}
            disabled={activeStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeStep === 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ChevronLeft size={20} /> Назад
          </button>
          
          <div className="text-slate-400 font-medium text-sm">
            Шаг {activeStep} / 8
          </div>

          <button 
            onClick={nextStep}
            disabled={activeStep === 8}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${activeStep === 8 ? 'bg-slate-100 text-slate-300 shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
          >
            {activeStep === 8 ? 'Конец' : 'Далее'} <ChevronRight size={20} />
          </button>
        </footer>
      </main>

      <footer className="mt-12 text-slate-400 text-sm pb-8">
        Разбор алгоритмов • 2024
      </footer>
    </div>
  );
};

export default App;
