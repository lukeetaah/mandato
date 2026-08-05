import React, { useState } from 'react';

const externalLinkProps = {
  target: '_blank',
  rel: 'noreferrer',
};

export const SiteFooter: React.FC = () => {
  const [sent, setSent] = useState(false);

  return (
    <footer className="border-t border-white/10 bg-[#081221] px-5 py-8 text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto_1.2fr] md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Mi Mandato</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            Juegos políticos para pensar qué decisiones dejan una marca.
          </p>
          <a
            href="https://ayudar.ar/ruptura"
            {...externalLinkProps}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-200/50 hover:bg-amber-300/20"
          >
            <span aria-hidden="true">♡</span>
            Ayudar a RUPTURA
          </a>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Otros juegos</p>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href="https://corpority.vercel.app/"
              {...externalLinkProps}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-sky-300"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-sky-400/20 text-xs font-black text-sky-200" aria-hidden="true">C</span>
              Corpority
            </a>
            <a
              href="https://ruptura.free.nf/?i=1"
              {...externalLinkProps}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-rose-300"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-rose-400/20 text-xs font-black text-rose-200" aria-hidden="true">R</span>
              RUPTURA
            </a>
            <a
              href="https://www.instagram.com/rup7ur4"
              {...externalLinkProps}
              className="mt-1 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-pink-300"
            >
              <span aria-hidden="true">◎</span>
              Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Tu voz</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">Enviar un comentario anónimo</p>
          {sent ? (
            <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-sm text-emerald-200">
              Gracias por compartirlo. El comentario fue enviado.
              <button type="button" onClick={() => setSent(false)} className="ml-2 underline underline-offset-2 hover:text-white">
                Enviar otro
              </button>
            </div>
          ) : (
            <form
              action="https://formspree.io/f/mkoyzjoy"
              method="POST"
              onSubmit={() => setSent(true)}
              className="mt-3 flex flex-col gap-2"
            >
              <input type="hidden" name="_subject" value="Comentario anónimo sobre Mi Mandato" />
              <label htmlFor="anonymous-comment" className="sr-only">Comentario anónimo</label>
              <textarea
                id="anonymous-comment"
                name="message"
                required
                rows={3}
                maxLength={1000}
                placeholder="¿Qué te gustaría contarnos?"
                className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-300/50 focus:ring-1 focus:ring-sky-300/30"
              />
              <button
                type="submit"
                className="self-end rounded-lg bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/25"
              >
                Enviar comentario
              </button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
};
