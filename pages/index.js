import Head from 'next/head'
import Todoapp from '../components/Todoapp'

const IndexPage = () => (
  <>
  <Head>
    <title>Next.js • TodoMVC</title>
  </Head>
  <Todoapp />
  <footer class="info">
  	<p>Double-click to edit a todo</p>
  	<p>Created by Misako Seki</p>
  </footer>
  </>
)

export default IndexPage
