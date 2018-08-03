#include <iostream>
#include <iomanip> 
using namespace std;

struct treenode
{
	int info;
	treenode *esq;
	treenode *dir;
};
typedef treenode* treenodeptr;

// Insere um no em uma arvore binaria
void tInsere(treenodeptr &p, int x)
{
	if(p == NULL)
	{
		p = new treenode;
		p->info = x;
		p->esq = NULL;
		p->dir = NULL;
	}
	else if(x >= p->info)
		tInsere(p->dir, x);
	else
		tInsere(p->esq, x);
}

treenodeptr tPesq(treenodeptr p, int x)
{
	if (p == NULL) // elemento n~ao encontrado
		return NULL;
	else if (x == p->info) // elemento encontrado na raiz
		return p;
	else if (x < p->info) // procura na sub´arvore esquerda
		return tPesq(p->esq, x);
	else // procura na sub´arvore direita
		return tPesq(p->dir, x);
}

void preOrdem (treenodeptr arvore, int x, int &i, int &p)
{
	if (arvore != NULL)
	{
		
		if(arvore->info == x){
			p = i;
		}
		i++;
		preOrdem(arvore->esq, x, i, p);
		preOrdem(arvore->dir, x, i, p);
	}
}

void emOrdem (treenodeptr arvore, int x, int &i, int &p)
{
	if (arvore != NULL)
	{
		emOrdem(arvore->esq, x, i, p);		
		if(arvore->info == x){
			p = i;
		}
		i++;
		emOrdem(arvore->dir, x, i, p);
	}
}

void posOrdem (treenodeptr arvore, int x, int &i, int &p)
{
	if (arvore != NULL)
	{
		posOrdem(arvore->esq, x, i, p);
		posOrdem(arvore->dir, x, i, p);		
		if(arvore->info == x){
			p = i;
		}
		i++;
	}
}

int main()
{
	treenodeptr arvore = NULL;
	treenodeptr p;
	int x, i=0, z, y=0, y2=0, y3=0, a=0, b=0, c=0;
	cin >> x;
	while(x != -1){
		tInsere(arvore,x);
		cin >> x;
	}
	cin >> z;
	preOrdem(arvore, z, y, a);
	emOrdem(arvore, z, y2, b);
	posOrdem(arvore, z, y3, c);
	
	if(a < b && a < c)
		cout << "Pre" << endl;
	else if (b < a && b < c)
		cout << "Em" << endl;
	else
		cout << "Pos" << endl;	
	return 0;
}
