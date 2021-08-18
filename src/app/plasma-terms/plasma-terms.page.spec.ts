import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PlasmaTermsPage } from './plasma-terms.page';

describe('PlasmaTermsPage', () => {
  let component: PlasmaTermsPage;
  let fixture: ComponentFixture<PlasmaTermsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlasmaTermsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlasmaTermsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
