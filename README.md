# QuoteBot

## Installation pour les dévs.
### 1. yarn
Lancer la commande ```yarn install``` à la racine du projet
### 2. Token Telegram
Créer un nouveau bot et générer un token Telegram via le **BotFather** (@BotFather sur Telegram), via la commande `/newbot`.

Une fois un nom choisi et validé, il vous retourne le token

Pour que le bot soit pleinement fonctionnel, il est nécessaire d'activer les requêtes _inline_ en envoyant la commande `/setinline` au **BotFather**.

### 3. Fichier .env
Créer un fichier **.env** (un fichier `.env.example` est fourni) à la racine du projet, et spécifier le token à la ligne suivante : 
```BOT_TOKEN=<token>```
### 4. Bases de données
Lancez les bases de données avec ```docker-compose up``` depuis la racine du projet  

### 5. Importer les données
Importez les données de base dans l'application avec ```npm run ts-import```

### 6. C'est parti !
Lancer la commande ```npm run ts-start``` depuis la racine, et tester si tout marche en envoyant un message au bot sur telegram.

## Liste des commandes

### /help
Obtient la liste des commandes disponibles

### /random
Obtient une citation aléatoire parmi la base de données

### /starred
Obtient la liste paginée de toutes les citations aimées par l'utilisateur

### /recommend
Fournit une liste de tags recommandés par rapport aux citations aimées par l'utilisateur.  
L'utilisateur peut sélectionner un tag et il obtiendra une citation du tag donnée écrite par un de ses auteurs préférés.  
Si le bot manque de données pour trouver une citation recommandée, une citation aléatoire est donnée.


## Modèle de données
### MongoDB
Dans la base de donnée MongoDB, nous avons définit 4 types d'entités différents : 

#### Quote
Représente une citation <br>
| Champs        | Type           |
| ------------- |:-------------:|
| _id     | string |
| text     | string      | 
| author | string      |
| tags | string      |
| likes | number      |
| language | string      |
| added | Date      |


#### Author
Représente un auteur <br>
| Champs        | Type           |
| ------------- |:-------------:|
| id     | number |
| name     | string      | 

#### User
Représente un utilisateur <br>
| Champs        | Type           |
| ------------- |:-------------:|
| username  (not mandatory)     | string |
| last_name (not mandatory)     | string      | 
| first_name (not mandatory)     | string      | 
| id | number      |
| is_bot | string      |
| likes | number      |
| language_code (not mandatory) | string      |

#### Liked
Représente un like <br>
| Champs        | Type           |
| ------------- |:-------------:|
| at     | Date |
| rank     | number      | 

## Neo4j

### Tags
- `User` (id, isBot, fisrtName, username, languageCode) : Représente un utilisateur de Telegram
- `Quote` (id) : Pointe vers un document de citatoin de MongoDB
- `Author` (id, nom) : Représente l'auteur d'une citation
- `Tag` (id, nom) : Représente un tag (love, philosophy, funny, ...) d'une citation

### Relations
- `LIKED` (User -> Quote) : Indique qu'un utilisateur a aimé une citation
- `WROTE` (Author -> Quote) : Indique qu'un auteur a écrit une citation
- `HASTAG` (Quote -> Tag) : Indique qu'une citation est marquée par un Tag


## Requêtes

### Citations favorites

``` Neo4J
MATCH (:User{id: $userId})-[LIKED]-(q:Quote) RETURN q ORDER BY q.id SKIP $offset LIMIT $limit
```

Renvoie les citations aimées de l'utilisateur, une pagination a été mise en place afin de ne pas surcharger l'affichage. Les citations sont ordrées par id afin de garantir qu'une citation ne se retrouve pas sur plusieurs pages lors de la navigation.

### Recommandations

```
MATCH (u:User{id: $userId})-[l:LIKED]->(q:Quote)-[l2:HASTAG]->(t:Tag) 
    RETURN t, count(*)
    ORDER BY count(*) desc
    LIMIT ` + amountOfRecommendedTags
```

Affichage du top 5 des tags préférés de l'utilisateur.

```
MATCH (u:User{id: $userId})-[l:LIKED]->(q:Quote)<-[w:WROTE]-(a:Author)
    MATCH (a)-[w2:WROTE]->(q2:Quote)-[l2:HASTAG]->(t:Tag{id:$tagId})
    WHERE NOT (u)-[:LIKED]->(q2)
    WITH q2, rand() AS r
    ORDER BY r
    RETURN q2
    LIMIT 1
```

Parmi les quotes likées, on cherche ses auteurs préférés.
On cherche des citations (pas encore likées) du tag choisi parmi ses auteurs préférés.
On en prend une aléatoirement parmi ce set et on l’affiche.
Si le bot manque de données pour trouver une citation recommandée, une citation aléatoire est donnée.
