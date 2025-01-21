type Props = {
  params: {
    id: string
  }
}

export default async function Page({ params }: Props) {
  // Ensure we're handling the async nature of the component
  const id = await Promise.resolve(params.id)

  return (
    <div>
      博客文章 ID: {id}
    </div>
  )
}

// Generate static params if you want to pre-render specific paths
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}