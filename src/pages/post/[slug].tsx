import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { Link, RichText } from 'prismic-dom';
import { Head } from 'next/document';
import { useRouter } from 'next/router';




interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    time: string;
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div className={styles.load}>
      Carregando...</div>
  }

  return (
    <>
      <main className={styles.container}>
        <article className={styles.post}>
        <img src={post.data.banner.url} />
          <h1>  {post.data.title}</h1>

          <div className={styles.divInfo}>
            <img src="/calendar.svg" alt="calendar" /> <time>{post.first_publication_date}</time>
            <img src="/user.svg" alt="Autor" /> <p>{post.data.author}</p>
            <img src="/clock.svg" alt="Autor" /> <p>{post.data.time} min</p>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(content => (
              <a>
                <strong>{content.heading}</strong>

                {content.body.map(contentbody => (
                  <p>{contentbody.text} </p>
                ))}
              </a>
            ))}
          </div>
        </article>
      </main>

    </>
  )

}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'UID')
  ], {
    fetch: ['UID.title', 'UID.subtitle', 'UID.author', 'UID.content'],
    pageSize: 100,
  })

  const posts = await prismic.getByUID('UID', 'limpeza-de-pele-profunda', {})

  return {
    paths: [
      { params: { slug: 'limpeza-de-pele-profunda' } }
    ],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const results = await prismic.getByUID('UID', String(slug), {})
 // console.log('Result chamada: ', JSON.stringify(results, null, 2));
  const post = {
    uid: results.uid,
    first_publication_date: format(new Date(results.first_publication_date), "d MMM yyyy", {
      locale: ptBR,
    }),
    data: {
      title: results.data.title,
      subtitle: results.data.subtitle,
      author: results.data.author,
      banner: {
        url: results.data.banner.url,
      },
      time :  getReadingTime(results),
      content: results.data.content
    }
  }
//  console.log('passou post aqui: ', JSON.stringify(post, null, 2));
  return { props: { post } };
}



function getReadingTime(results) {
  interface texto {
    text: string;
  }
  enum readingTime {
    tempoMedio = 200
  }
  let finalTime = []
  console.log('passou post aqui: ', JSON.stringify(results, null, 2));
  results.data.content.map(post => {
    const texto = {
     text: post.body.find((o) => o.type).text,
 
    }
  //  console.log('passou post aqui: ',texto, null, 2);
    finalTime = texto.text.split(' ')
  }
  )
  return (finalTime.length / readingTime.tempoMedio).toFixed(0)
};


















