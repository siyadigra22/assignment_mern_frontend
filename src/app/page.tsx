import SubmissionForm from '@/components/SubmissionForm'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
       <div className="flex justify-center">
        <h1 className="text-2xl font-bold">MERN STACK MACHINE TEST</h1>
      </div>
      <SubmissionForm />
    </main>
  )
}