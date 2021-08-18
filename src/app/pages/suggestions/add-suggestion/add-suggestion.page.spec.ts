import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddSuggestionPage } from './add-suggestion.page';

describe('AddSuggestionPage', () => {
  let component: AddSuggestionPage;
  let fixture: ComponentFixture<AddSuggestionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSuggestionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddSuggestionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
