import Image from 'next/image'
import styles from './page.module.css'
import axios from 'axios';
import MainGame from '../../components/MainGame';



export default function Home() {
  return (
    <main>
      <div className={styles.navbar}>
        <h2 className={styles.logo}>eBirder</h2>
        <img src="/bird.svg" alt="a cute bird" width="25" height="25" className="navbarsvg"/>
      </div>
        <MainGame />
    </main>
  )
}
