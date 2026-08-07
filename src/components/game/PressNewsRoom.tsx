import React, { useState } from 'react';
import type { GameState, HeadlineItem } from '@engine/types';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { HemerotecaModal } from './HemerotecaModal';

export interface PressNewsRoomProps {
  gameState: GameState;
}

export const PressNewsRoom: React.FC<PressNewsRoomProps> = ({ gameState }) => {
  const [activeTab, setActiveTab] = useState<'diario' | 'noticiero' | 'impacto' | 'redes'>('diario');
  const [page, setPage] = useState(0);
  const [showHemeroteca, setShowHemeroteca] = useState(false);

  const { dailyHeadlines, mediaOutlets, eventLog, hemeroteca } = gameState;

  // Headline interactivo seleccionado para ver en noticiero o diario
  const [selectedHeadlineId, setSelectedHeadlineId] = useState<string | null>(null);

  const currentIssue = hemeroteca[0] ?? {
    editionNumber: 1000 + gameState.turn,
    dateString: `${gameState.calendar.season} de ${gameState.calendar.year}`,
    editorialText: 'El país asume el costo de las medidas recientes.',
    caricatureCaption: '“La estabilidad no hace ruido: se nota cuando una familia puede planificar la semana sin consultar tres precios distintos.” — Clara B. Arce, economista del Sur.',
    classifieds: ['Venta de contadores de billetes.', 'Alquiler de salones de conferencia.'],
    obituary: 'Falleció la estabilidad cambiaria.',
    adSatire: 'Compre dólares cara grande en el mercado paralelo.',
  };

  const activeHeadline: HeadlineItem = (selectedHeadlineId ? dailyHeadlines.find(h => h.id === selectedHeadlineId) : null) ?? dailyHeadlines[0] ?? {
    id: 'hl-default',
    outletName: 'Canal Sur 24',
    title: 'GESTIÓN EN LA MIRA: CONFERENCIA EN LA SEDE DE GOBIERNO',
    subhead: 'Analistas debaten el impacto de las últimas medidas oficiales en el clima político nacional.',
    category: 'politico',
    bias: 'oficialista',
  };

  const recentDecisionLogs = eventLog.filter((log) => log.type === 'decision').slice(-6).reverse();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <HemerotecaModal
        isOpen={showHemeroteca}
        onClose={() => setShowHemeroteca(false)}
        hemeroteca={hemeroteca}
      />

      {/* Selector de experiencia mediática */}
      <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('diario')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'diario'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>🗞️</span> El Diario del Sur
          </button>
          <button
            onClick={() => setActiveTab('noticiero')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'noticiero'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>📺</span> Noticiero TV 24hs
          </button>
          <button
            onClick={() => setActiveTab('redes')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'redes'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>📲</span> Redes y Tendencias
          </button>
          <button
            onClick={() => setActiveTab('impacto')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'impacto'
                ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>⚖️</span> Impacto Moral
          </button>
        </div>

        <Button variant="gold" size="sm" onClick={() => setShowHemeroteca(true)}>
          📚 Hemeroteca ({hemeroteca.length} ediciones)
        </Button>
      </div>

      {/* ─── TAB 1: EL DIARIO IMPRESO ─── */}
      {activeTab === 'diario' && (
        <div className="space-y-6">
          <div className="bg-[#f5edd6] text-slate-950 p-8 rounded-2xl border-4 border-[#d1c49f] shadow-2xl relative font-serif">
            {/* Header del Periódico */}
            <div className="border-b-2 border-slate-950 pb-4 mb-6 text-center">
              <div className="flex justify-between text-[11px] text-slate-800 font-bold uppercase tracking-wider mb-2 font-sans">
                <span>N° {currentIssue.editionNumber}</span>
                <span>República del Sur</span>
                <span>{currentIssue.dateString}</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-950 font-serif my-2 uppercase">
                EL DIARIO DEL SUR
              </h1>
              <p className="text-xs text-slate-800 italic font-serif">
                "La prensa independiente al servicio del país" — Registro histórico oficial
              </p>
            </div>

            {/* Paginador tipo libro */}
            <div className="flex justify-center gap-3 mb-6 font-sans">
              {['Página 1: Portada y Medios', 'Página 2: Editorial & Frase de época', 'Página 3: Clasificados & Obituarios'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === idx ? 'bg-slate-950 text-amber-200 shadow-md' : 'bg-[#e4d8b8] text-slate-800 hover:bg-[#d8caaa]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* PÁGINA 1: PORTADA INTERACTIVA */}
            {page === 0 && (
              <div className="space-y-4 font-sans">
                <p className="text-xs text-slate-700 italic mb-2 font-serif">
                  Hacé clic en cualquier noticia para destacarla y ampliar información:
                </p>
                {dailyHeadlines.map((hl) => {
                  const isSelected = activeHeadline.id === hl.id;
                  return (
                    <div
                      key={hl.id}
                      onClick={() => setSelectedHeadlineId(hl.id)}
                      className={`p-5 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#decfae] border-slate-950 shadow-md'
                          : 'bg-[#eadeca] border-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs mb-2">
                        <Badge variant={hl.bias === 'oficialista' ? 'emerald' : hl.bias === 'opositor' ? 'rose' : 'gold'}>
                          {hl.bias.toUpperCase()}
                        </Badge>
                        <span className="text-slate-700 text-[11px] font-semibold">{hl.outletName}</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-950 mb-2 leading-tight font-serif">
                        {hl.title}
                      </h2>
                      <p className="text-xs text-slate-900 leading-relaxed italic font-serif">
                        {hl.subhead}
                      </p>
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-slate-400/70 space-y-2 text-xs text-slate-800 leading-relaxed font-serif">
                          {hl.causalStoryText && <p><strong>Qué hay detrás:</strong> {hl.causalStoryText}</p>}
                          {hl.humanImpactText && <p><strong>Por qué importa:</strong> {hl.humanImpactText}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* PÁGINA 2: EDITORIAL Y CARICATURA */}
            {page === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div className="p-4 bg-[#eadeca] rounded-xl border border-slate-400">
                  <h4 className="font-bold text-slate-950 border-b border-slate-600 pb-1 mb-2 font-serif text-sm">
                    Editorial política del período
                  </h4>
                  <p className="text-slate-900 leading-relaxed text-[12px] font-serif">
                    {currentIssue.editorialText}
                  </p>
                </div>

                <div className="p-4 bg-[#eadeca] rounded-xl border border-slate-400">
                  <h4 className="font-bold text-slate-950 border-b border-slate-600 pb-1 mb-2 font-serif text-sm">
                    Frase de época
                  </h4>
                  <div className="p-4 bg-[#decfae] rounded text-center italic text-slate-900 text-xs font-serif">
                    🖋️ {currentIssue.caricatureCaption}
                  </div>
                </div>
              </div>
            )}

            {/* PÁGINA 3: MEDIOS Y CLASIFICADOS */}
            {page === 2 && (
              <div className="space-y-4 font-sans">
                <div className="p-4 bg-[#eadeca] rounded-xl border border-slate-400 text-xs">
                  <h4 className="font-bold text-slate-950 mb-2 font-serif text-sm">Línea editorial de medios nacionales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mediaOutlets.slice(0, 4).map((m) => (
                      <div key={m.id} className="p-2.5 bg-[#dfcfad] rounded border border-slate-400/80">
                        <div className="flex justify-between font-bold text-slate-950 text-xs">
                          <span>{m.name}</span>
                          <span className="text-emerald-700">{m.credibility}% credibilidad</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#eadeca] rounded-xl border border-slate-400 text-[11px] flex flex-wrap gap-4 justify-between">
                  <span><b>Aviso satírico:</b> {currentIssue.adSatire}</span>
                  <span><b>Obituario:</b> {currentIssue.obituary}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: NOTICIERO TV 24HS INTERACTIVO ─── */}
      {activeTab === 'noticiero' && (
        <div className="space-y-6 font-sans">
          <style>
            {`
              @keyframes bgGradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes rotateGlobe {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes scrollTicker {
                0% { transform: translateX(100vw); }
                100% { transform: translateX(-100%); }
              }
            `}
          </style>

          {/* Pantalla del Noticiero */}
          <div 
            className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-video max-h-[440px] flex flex-col justify-between shadow-2xl"
            style={{
              background: 'linear-gradient(270deg, #020617, #0f172a, #020617)',
              backgroundSize: '200% 200%',
              animation: 'bgGradient 15s ease infinite',
            }}
          >
            {/* Fondo con animación de globo terráqueo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 flex items-center justify-center">
              <div 
                className="rounded-full border border-slate-500/30"
                style={{ width: '800px', height: '800px', animation: 'rotateGlobe 60s linear infinite' }}
              >
                <div className="absolute top-1/2 left-0 w-full h-px bg-slate-500/20" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-slate-500/20" />
              </div>
            </div>

            {/* Header de la transmisión */}
            <div className="flex justify-between items-center z-10 p-6">
              <div className="flex items-center gap-3">
                <span className="bg-red-600 text-white font-bold text-[10px] px-3 py-1 rounded-sm uppercase tracking-widest shadow-md">
                  EN VIVO
                </span>
                <span className="text-white font-bold text-sm tracking-[0.2em] opacity-90">
                  {activeHeadline.outletName.toUpperCase()}
                </span>
              </div>
              <Badge variant="rose">{activeHeadline.bias.toUpperCase()}</Badge>
            </div>

            {/* Zócalo principal de TV (Lower Third) */}
            <div className="z-10 mt-auto flex flex-col w-full">
              <div className="bg-slate-900/95 border-t border-slate-700/50 backdrop-blur-md px-8 py-6 relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  ÚLTIMO MOMENTO — COBERTURA EN DIRECTO
                </span>
                <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
                  {activeHeadline.title}
                </h2>
                <div className="text-xs md:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
                  {activeHeadline.subhead}
                </div>
                {activeHeadline.causalStoryText && (
                  <div className="mt-3 max-w-3xl text-[11px] md:text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {activeHeadline.causalStoryText} {activeHeadline.humanImpactText}
                  </div>
                )}
              </div>
              
              {/* Ticker de noticias en movimiento */}
              <div className="bg-amber-500 px-4 py-2 flex items-center overflow-hidden whitespace-nowrap">
                <span className="bg-slate-950 text-white text-[10px] font-black px-3 py-1 mr-4 z-20 shadow-md uppercase">
                  TITULARES
                </span>
                <div className="flex-1 overflow-hidden relative h-5">
                  <div 
                    className="absolute whitespace-nowrap flex gap-12 items-center h-full text-slate-950 font-bold text-xs"
                    style={{ animation: 'scrollTicker 35s linear infinite' }}
                  >
                    {dailyHeadlines.map((hl) => (
                      <span key={hl.id} className="cursor-pointer hover:underline">
                        ■ [{hl.outletName}] {hl.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selector de noticias para cambiar lo que se muestra en TV */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Seleccionar noticia para transmitir en vivo:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dailyHeadlines.map((hl) => (
                <button
                  key={hl.id}
                  onClick={() => setSelectedHeadlineId(hl.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                    activeHeadline.id === hl.id
                      ? 'bg-sky-950/80 border-sky-400 text-sky-100 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                    <span>{hl.outletName}</span>
                    <span className="capitalize">{hl.category}</span>
                  </div>
                  <div className="font-bold text-slate-100 line-clamp-1">{hl.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: PANEO DE IMPACTO MORAL ─── */}
      {activeTab === 'impacto' && (
        <div className="space-y-6">
          <Card
            title="⚖️ Balance de responsabilidad y sentimiento humano"
            subtitle="Cómo tus elecciones recientes cambiaron la vida cotidiana de las personas"
          >
            {recentDecisionLogs.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">
                Aún no has tomado decisiones decisivas en este mandato.
              </p>
            ) : (
              <div className="space-y-4">
                {recentDecisionLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-sans">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-sky-400">Turno {log.turn}</span>
                      <Badge variant="gold">Decisión ejecutada</Badge>
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm font-serif">{log.title}</h4>
                    <p className="text-xs text-amber-200 italic bg-amber-950/40 p-3 rounded-lg border border-amber-500/30 font-serif">
                      💬 "{log.emotionalText ?? log.description}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ─── TAB 4: REDES SOCIALES Y TENDENCIAS ─── */}
      {activeTab === 'redes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
          {/* Columna 1 & 2: Feed de publicaciones */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-extrabold">🌐 X-SUR FEED EN VIVO</span>
                <span className="text-[10px] text-slate-500">• Reacciones de la ciudadanía</span>
              </div>
              <Badge variant={gameState.character.popularity > 50 ? 'emerald' : 'rose'}>
                {gameState.character.popularity > 50 ? 'TRENDING FAVORABLE' : 'TENDENCIA ADVERSA'}
              </Badge>
            </div>

            {/* Posts generados dinámicamente */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 font-black flex items-center justify-center text-xs">EC</div>
                    <div>
                      <div className="font-extrabold text-slate-100 text-xs">El Ciudadano K</div>
                      <div className="text-[10px] text-slate-400">@ciudadano_sur</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Hace 15m</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {gameState.nation.economy.inflation > 55
                    ? 'Ir al supermercado se convirtió en un deporte extremo. Los precios cambian en la fila de la caja. ¿Alguien en la Casa de Gobierno registra esto? #InflacionFueraDeControl'
                    : 'La calma de precios se siente en el barrio. Ojalá dure y no sea solo un espejismo electoral. #EstabilidadSur'}
                </p>
                <div className="flex gap-6 text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 font-semibold">
                  <span>💬 412</span> <span>🔁 1.2k</span> <span>❤️ 4.8k</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black flex items-center justify-center text-xs">MO</div>
                    <div>
                      <div className="font-extrabold text-slate-100 text-xs">Mercados & Finanzas</div>
                      <div className="text-[10px] text-slate-400">@mercados_ok</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Hace 1h</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {gameState.nation.economy.reserves < 25
                    ? '⚠️ Alerta en la City: las reservas del Banco Central cayeron a niveles críticos. Los analistas prevén tensión en el dólar paralelo. #AlertaReservas'
                    : '📈 Clima positivo en los bonos sovereign. Los inversores destacan la disciplina de las reservas internacionales. #RiesgoPais'}
                </p>
                <div className="flex gap-6 text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 font-semibold">
                  <span>💬 189</span> <span>🔁 890</span> <span>❤️ 2.3k</span>
                </div>
              </div>

              {gameState.nation.governance.corruption > 50 && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black flex items-center justify-center text-xs">PI</div>
                      <div>
                        <div className="font-extrabold text-rose-200 text-xs">Prensa Independiente</div>
                        <div className="text-[10px] text-rose-400/80">@prensa_libre</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-rose-400/70">Hace 2h</span>
                  </div>
                  <p className="text-rose-100 text-xs leading-relaxed">
                    🚨 BOMBA: Crece la indignación social por sospechas de opacidad en contrataciones del Ejecutivo. Exigen explicaciones urgentes. #CarpetasAbiertas
                  </p>
                  <div className="flex gap-6 text-[10px] text-rose-300/80 pt-2 border-t border-rose-900/60 font-semibold">
                    <span>💬 1.5k</span> <span>🔁 4.2k</span> <span>❤️ 8.9k</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna 3: Tendencias & Hashtags */}
          <div className="space-y-4">
            <Card title="🔥 Tendencias Nacionales" subtitle="Lo más comentado en la República">
              <div className="space-y-3 font-sans">
                {[
                  { tag: '#MiMandato', count: '145K publicaciones', category: 'Política' },
                  { tag: gameState.nation.economy.inflation > 50 ? '#InflacionRecord' : '#PreciosEstables', count: '98K publicaciones', category: 'Economía' },
                  { tag: gameState.character.popularity < 40 ? '#CacerolazoNacional' : '#RespaldoPresidencial', count: '64K publicaciones', category: 'Sociedad' },
                  { tag: '#CorteSuprema', count: '32K publicaciones', category: 'Instituciones' },
                  { tag: '#LitioSur', count: '18K publicaciones', category: 'Recursos' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">{item.category}</span>
                    <div className="font-extrabold text-amber-300 text-xs">{item.tag}</div>
                    <span className="text-[10px] text-slate-400 block">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
