import Link from 'next/link'

export function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-red-500/20 to-black/50 backdrop-blur border border-red-500/50 rounded-2xl p-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Únete a la Red
        </h2>
        <p className="text-xl text-gray-300 mb-10">
          Miles de estudiantes ya optimizan su tiempo académico. 
          Cientos de especialistas ya monetizan su conocimiento.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register?role=student"
            className="px-8 py-4 text-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg text-center"
          >
            Registrarse como Estudiante
          </Link>
          <Link
            href="/auth/register?role=specialist"
            className="px-8 py-4 text-lg font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors rounded-lg text-center border-2 border-gray-700"
          >
            Aplicar como Especialista
          </Link>
        </div>
      </div>
    </section>
  )
}
