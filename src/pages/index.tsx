import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { useEffect } from 'react';
import { useState } from 'react';


type Post = {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(results: PostPagination, homeProps: HomeProps) {

  const [showElement, setShowElement] = useState(false)
  const showOrHide = () => setShowElement(true)

  return (
    <main className={styles.container}>
      <div className={styles.posts}>
        {results.results.map(post => (
          <Link href={`/post/${post.uid}`}>
            <a key={post.uid}>
              <strong>
                {post.data.title}
              </strong>
              <p>{post.data.subtitle}
              </p>
              <div className={styles.divInfo}>
                <img src="/calendar.svg" alt="calendar" /> <time>{post.first_publication_date}</time>
                <img src="/user.svg" alt="Autor" /> <p>{post.data.author}</p>
              </div>
            </a>
          </Link>

        ))}
        <div className={styles.carregarMais}>
          {results.next_page != null ? <Link href="/">
            Carregar mais posts
          </Link> : null}
        </div>
      </div>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'UID')
  ], {
    fetch: ['UID.title', 'UID.subtitle', 'UID.author', 'UID.content'],
    pageSize: 100,
  })

  console.log('postsResponse: ', JSON.stringify(postsResponse, null, 2));

  const postPagination = {

    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date), "d MMM yyyy", {
          locale: ptBR,
        }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },

      };
    })
  }

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.first_publication_date), "d MMM yyyy", {
        locale: ptBR,
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },

    };
  })

  const homeProps = {
    postsPagination: postPagination
  }

  console.log('passou aqui: ', JSON.stringify(postPagination, null, 2));
  return { props: { results, homeProps } };
}




