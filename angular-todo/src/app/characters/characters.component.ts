import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Character {
  id: number;
  name: string;
  gender: string;
  profile_image_url: string;
  path_icon_url: string;
  element_icon_url: string;
  full_image_url: string;
  description: string;
  affiliation: string;
  path: string;
  element: string;
  roles: string[];
  rarity: string;
  relase_version: string;
  release_date: string;
  expanded?: boolean;
  owned?: boolean;
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css']
})
export class CharactersComponent implements OnInit {
  characters: Character[] = [];
  filteredCharacters: Character[] = [];
  visibleStartIndex = 0;
  visibleCount = 5;
  selectedCharacter: Character | null = null;
  userId = 1;

  elements: string[] = [];
  paths: string[] = [];
  rarities: string[] = [];
  affiliations: string[] = [];
  roles: string[] = [];
  genders: string[] = [];

  filters = {
    element: '',
    path: '',
    role: '',
    rarity: '',
    affiliation: '',
    gender: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Character[]>('https://backend-production-a22a.up.railway.app/api/characters')
      .subscribe(characters => {
        this.characters = characters.map(c => ({
          ...c,
          expanded: false,
          owned: false
        }));

        this.filteredCharacters = [...this.characters];

        this.elements = [...new Set(this.characters.map(c => c.element))];
        this.paths = [...new Set(this.characters.map(c => c.path))];
        this.rarities = [...new Set(this.characters.map(c => c.rarity))];
        this.affiliations = [...new Set(this.characters.map(c => c.affiliation))];
        this.roles = [...new Set(this.characters.flatMap(c => c.roles))];
        this.genders = [...new Set(this.characters.map(c => c.gender))];

        this.http.get<{ character_id: number; has_character: boolean; }[]>(
          `https://backend-production-a22a.up.railway.app/api/user-characters/${this.userId}`
        ).subscribe(userChars => {
          userChars.forEach(uc => {
            const match = this.characters.find(c => c.id === uc.character_id);
            if (match) match.owned = uc.has_character;
          });
        });
      });
  }

  get visibleCharacters(): Character[] {
    const total = this.filteredCharacters.length;
    const end = this.visibleStartIndex + this.visibleCount;
    if (end <= total) {
      return this.filteredCharacters.slice(this.visibleStartIndex, end);
    } else {
      return [
        ...this.filteredCharacters.slice(this.visibleStartIndex),
        ...this.filteredCharacters.slice(0, end - total)
      ];
    }
  }

  // Puedes reemplazar el (wheel) del HTML con este decorador si prefieres
  // @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    // Evitar que el scroll funcione si estás sobre el contenedor de detalles
    const target = event.target as HTMLElement;
    if (target.closest('.character-details-container')) {
      return; // No hacer nada si el scroll viene del panel de detalles
    }

    if (event.deltaY > 0) {
      this.visibleStartIndex = (this.visibleStartIndex + 1) % this.filteredCharacters.length;
    } else {
      this.visibleStartIndex =
        (this.visibleStartIndex - 1 + this.filteredCharacters.length) % this.filteredCharacters.length;
    }
  }


  selectCharacter(character: Character) {
    this.selectedCharacter = character;
  }

  toggleExpand(character: Character) {
    character.expanded = !character.expanded;
  }

  toggleOwned(character: Character) {
    character.owned = !character.owned;
    this.http.post('https://backend-production-a22a.up.railway.app/api/user-characters/set', {
      userId: this.userId,
      characterId: character.id,
      hasCharacter: character.owned
    }).subscribe({
      next: () => {},
      error: () => {
        alert("Error al actualizar personaje");
        character.owned = !character.owned;
      }
    });
  }

  applyFilters() {
    this.filteredCharacters = this.characters.filter(c =>
      (!this.filters.element || c.element === this.filters.element) &&
      (!this.filters.path || c.path === this.filters.path) &&
      (!this.filters.role || c.roles.includes(this.filters.role)) &&
      (!this.filters.rarity || c.rarity === this.filters.rarity) &&
      (!this.filters.affiliation || c.affiliation === this.filters.affiliation) &&
      (!this.filters.gender || c.gender === this.filters.gender)
    );

    // Resetear scroll al aplicar filtros
    this.visibleStartIndex = 0;
  }

  // En el componente Angular
  onCharacterListWheel(event: WheelEvent) {
    const container = event.currentTarget as HTMLElement;
    if (event.deltaY !== 0) {
      container.scrollLeft += event.deltaY;  // scroll horizontal con rueda
      event.preventDefault();
    }
  }

}
