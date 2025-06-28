import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

interface Character {
  id: number;
  name: string;
  gender: string | null;
  birthplace: string | null;
  weapon_type: string | null;
  weapon_type_url?: string;
  profile_image_url: string;
  full_image_url: string;
  description: string;
  affiliation: string | null;
  element: string | null;
  element_icon_url: string;
  rarity: string;
  release_version: string | null;
  release_date: string | null;
  roles: string[];
  expanded?: boolean;
  owned?: boolean;
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './wuwa_characters.component.html',
  styleUrls: ['./wuwa_characters.component.css']
})
export class Wuwa_charactersComponent implements OnInit {
  characters: Character[] = [];
  filteredCharacters: Character[] = [];
  visibleStartIndex = 0;
  visibleCount = 5;
  selectedCharacter: Character | null = null;
  userId = 1;

  elements: string[] = [];
  weaponTypes: string[] = [];
  rarities: string[] = [];
  affiliations: string[] = [];
  roles: string[] = [];
  genders: string[] = [];
  birthplaces: string[] = [];


  filters = {
    element: '',
    weapon_type: '',
    role: '',
    rarity: '',
    affiliation: '',
    birthplace:'',
    gender: ''
  };

  constructor(private http: HttpClient, private location: Location) {}

  ngOnInit() {
    this.http.get<Character[]>('https://backend-production-a22a.up.railway.app/wuwa-characters')
      .subscribe(characters => {
        this.characters = characters.map(c => ({
          ...c,
          expanded: false,
          owned: false
        }));

        this.filteredCharacters = [...this.characters];

        this.elements = [...new Set(this.characters.map(c => c.element).filter((e): e is string => e !== null))];
        this.weaponTypes = [...new Set(this.characters.map(c => c.weapon_type).filter((w): w is string => w !== null))];
        this.rarities = [...new Set(this.characters.map(c => c.rarity))];
        this.affiliations = [...new Set(this.characters.map(c => c.affiliation).filter((a): a is string => a !== null))];
        this.roles = [...new Set(this.characters.flatMap(c => c.roles))];
        this.genders = [...new Set(this.characters.map(c => c.gender).filter((g): g is string => g !== null))];
        this.birthplaces = [...new Set(this.characters.map(c => c.birthplace).filter((b): b is string => b !== null))];


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

  onScroll(event: WheelEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.character-details-container')) return;

    if (event.deltaY > 0) {
      this.visibleStartIndex = (this.visibleStartIndex + 1) % this.filteredCharacters.length;
    } else {
      this.visibleStartIndex = (this.visibleStartIndex - 1 + this.filteredCharacters.length) % this.filteredCharacters.length;
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
      (!this.filters.weapon_type || c.weapon_type === this.filters.weapon_type) &&
      (!this.filters.role || c.roles.includes(this.filters.role)) &&
      (!this.filters.rarity || c.rarity === this.filters.rarity) &&
      (!this.filters.affiliation || c.affiliation === this.filters.affiliation) &&
      (!this.filters.birthplace || c.birthplace === this.filters.birthplace) &&
      (!this.filters.gender || c.gender === this.filters.gender)
    );
    this.visibleStartIndex = 0;
  }


  onCharacterListWheel(event: WheelEvent) {
    const container = event.currentTarget as HTMLElement;
    if (event.deltaY !== 0) {
      container.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }

  goBack() {
    this.location.back();
  }

  goForward() {
    this.location.forward();
  }
}
